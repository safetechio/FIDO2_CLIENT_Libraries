import $ from 'jquery';

$(document).ready(function () {

    // check whether current browser supports WebAuthn
    if (!window.PublicKeyCredential) {
        alert("Error: this browser does not support WebAuthn");
    }
});

class SAFETECHioWebAuthnConfig {
    constructor() {
        this.registerBeginEndpoint = "";
        this.registerCompleteEndpoint = "";
        this.authenticateBeginEndpoint = "";
        this.authenticateCompleteEndpoint = "";
        this.username = "";
        this.usernameInputID = "";
        this.logErrors = true;
        this.logSuccess = false;
        this.giveErrorAlert = false;
        this.giveSuccessAlert = false;
    }
}

class SAFETECHioWebAuthn {

    constructor(config) {
        this.config = config;
        window.localStorage.setItem("SAFETECHioWebAuthn", "")
    }

    // Base64 to ArrayBuffer
    static bufferDecode(value) {
        return Uint8Array.from(atob(value), c => c.charCodeAt(0));
    }

    // ArrayBuffer to URLBase64
    static bufferEncode(value) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    }

    username() {
        if(this.config.username.length > 0) {
            return this.config.username;
        }

        if(this.config.usernameInputID.length > 0) {
            let username = $(this.config.usernameInputID).val();
            if (username === "") {
                alert("Please enter a username");
                throw new Error("missing data: username");
            }
            return username;
        }

        alert("Neither username nor usernameInputID is set. Please set one of these parameters in the config.");
        throw new Error("missing config parameters: username or usernameInputID");
    }

    handleError(error, type) {
        if(this.config.logErrors){
            console.log(error);
        }

        let err = JSON.parse(error.responseText);

        if(this.config.logErrors){
            console.log(err);
        }

        if(this.config.giveErrorAlert){
            alert("failed to "+type+" '" + this.username() + "'. \n error : " + err.error.message)
        }
    }

    handleSuccess(success, type) {
        if(this.config.logSuccess) {
            console.log(success);
        }

        if(this.config.giveSuccessAlert) {
            alert("successfully "+type+" " + this.username() + "!");
        }
    }

    registerUser() {
        $.get(
            this.config.registerBeginEndpoint + this.username(),
            null,
            function (data) {
                return data
            },
            'json'
        )
        .then((credentialCreationOptions) => {

            credentialCreationOptions.publicKey.challenge = SAFETECHioWebAuthn.bufferDecode(credentialCreationOptions.publicKey.challenge);
            credentialCreationOptions.publicKey.user.id = SAFETECHioWebAuthn.bufferDecode(credentialCreationOptions.publicKey.user.id);
            if (credentialCreationOptions.publicKey.excludeCredentials) {
                for (let i = 0; i < credentialCreationOptions.publicKey.excludeCredentials.length; i++) {
                    credentialCreationOptions.publicKey.excludeCredentials[i].id = SAFETECHioWebAuthn.bufferDecode(credentialCreationOptions.publicKey.excludeCredentials[i].id);
                }
            }

            return navigator.credentials.create({
                publicKey: credentialCreationOptions.publicKey
            });
        })
        .then((credential) => {

            let attestationObject = credential.response.attestationObject;
            let clientDataJSON = credential.response.clientDataJSON;
            let rawId = credential.rawId;

            let msg = JSON.stringify({
                id: credential.id,
                rawId: SAFETECHioWebAuthn.bufferEncode(rawId),
                type: credential.type,
                response: {
                    attestationObject: SAFETECHioWebAuthn.bufferEncode(attestationObject),
                    clientDataJSON: SAFETECHioWebAuthn.bufferEncode(clientDataJSON),
                },
            });

            return $.post(
                this.config.registerCompleteEndpoint + this.username(),
                msg,
                function (data) {
                    return data
                },
                'json'
            )
        })
        .then((success) => {
            this.handleSuccess(success, "registered")
        })
        .catch((error) => {
            this.handleError(error, "register");
        })
    }

    authenticateUser() {
        $.get(
            this.config.authenticateBeginEndpoint + this.username(),
            null,
            function (data) {
                return data
            },
            'json'
        )
        .then((credentialRequestOptions) => {

            credentialRequestOptions.publicKey.challenge = SAFETECHioWebAuthn.bufferDecode(credentialRequestOptions.publicKey.challenge);
            credentialRequestOptions.publicKey.allowCredentials.forEach(function (listItem) {
                listItem.id = SAFETECHioWebAuthn.bufferDecode(listItem.id)
            });

            return navigator.credentials.get({
                publicKey: credentialRequestOptions.publicKey
            })
        })
        .then((assertion) => {

            let authData = assertion.response.authenticatorData;
            let clientDataJSON = assertion.response.clientDataJSON;
            let rawId = assertion.rawId;
            let sig = assertion.response.signature;
            let userHandle = assertion.response.userHandle;

            let msg = JSON.stringify({
                id: assertion.id,
                rawId: SAFETECHioWebAuthn.bufferEncode(rawId),
                type: assertion.type,
                response: {
                    authenticatorData: SAFETECHioWebAuthn.bufferEncode(authData),
                    clientDataJSON: SAFETECHioWebAuthn.bufferEncode(clientDataJSON),
                    signature: SAFETECHioWebAuthn.bufferEncode(sig),
                    userHandle: SAFETECHioWebAuthn.bufferEncode(userHandle),
                },
            });

            return $.post(
                this.config.authenticateCompleteEndpoint + this.username(),
                msg,
                function (data) {
                    return data
                },
                'json'
            )
        })
        .then((success) => {
            this.handleSuccess(success, "authenticated")
        })
        .catch((error) => {
            this.handleError(error, "authenticate")
        })
    }
}

export {SAFETECHioWebAuthn, SAFETECHioWebAuthnConfig};