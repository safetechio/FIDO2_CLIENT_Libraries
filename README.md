# FIDO 2 / WebAuthn Client Side JS Library

For more advanced details of how to use this library please see the [php full stack example](https://github.com/SAFETECHio/PHP-FIDO2-Example). 

## Installation

`npm install SAFETECHio/FIDO2_CLIENT_Libraries`

## Example Use

**The JS**

```js
import {SAFETECHioWebAuthn, SAFETECHioWebAuthnConfig} from 'fido2_clientside';

let config = new SAFETECHioWebAuthnConfig();
config.registerBeginEndpoint += "../backend/RegisterBegin.php?username=";
config.registerCompleteEndpoint += "../backend/RegisterComplete.php?username=";
config.authenticateBeginEndpoint += "../backend/AuthenticateBegin.php?username=";
config.authenticateCompleteEndpoint += "../backend/AuthenticationComplete.php?username=";
config.usernameInputID = "#email";
config.giveErrorAlert = true;
config.giveSuccessAlert = true;

let SafeTechWebAuthn = new SAFETECHioWebAuthn(config);

export {config, SafeTechWebAuthn};
```

**The HTML**

```html
<!DOCTYPE html>
<html>

<head>
    <title>SAFETECHio FIDO2 Example</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>

<body>

<div class="container">
    <div class="row">
        <div class="col-md-2">
            <label for="email" class="col-12 col-form-label">Email :</label>
        </div>
        <div class="col-md-6">
            <input class="form-control" type="text" name="username" id="email" placeholder="i.e. name@example.com">
        </div>
        <div class="col-md-2">
            <button class="btn btn-primary btn-block" onclick="tech.SafeTechWebAuthn.registerUser()">Register</button>
        </div>
        <div class="col-md-2">
            <button class="btn btn-success btn-block"  onclick="tech.SafeTechWebAuthn.authenticateUser()">Authenticate</button>
        </div>
    </div>
</div>

<script src="main.js"></script>

</body>
</html>
```