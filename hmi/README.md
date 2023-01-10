# Vulnerable Human Machine Interface

Forked from open-sourced project, FUXA.

### Vulnerabilities:

1. Sensitive Data Leakage

      - Edited authentication and creation of new accounts code to exclude bcrypt hashing

      - Edited the query user API to disable need for authentication to view user data  

      - Edited the signin user API to disable need for authentication to perform SQL injection to leak user data

2. Broken Authenentication

      - Edited jsonwebtoken library (v8.5.1) to allow for vulnerabilities in JWT token

	    1. None Algorithm Vulnerability
	    
			```
			// comment out this check
			if (!hasSignature && secretOrPublicKey){
			    return done(new JsonWebTokenError('jwt signature is required'));
			}
			```

			- Visit [portswigger](https://portswigger.net/web-security/jwt) for more details

			- Essentially, since we do not verify the signature of our JWT tokens, we can simply edit the body to escalate privileges

	    2. Key Confusion Vulnerability

			```
			// comment out this check
			if (!~options.algorithms.indexOf(decodedToken.header.alg)) {
			    return done(new JsonWebTokenError('invalid algorithm'));
			}
			```

			- Visit [portswigger](https://portswigger.net/web-security/jwt/algorithm-confusion) for more details

			- Complicated attack, but basically, we will be using an exposed public key (part of a key pair used for signing JWT) as the secret to sign the JWT by base64 encoding it first before generating the JWT.

	    3. Weak JWT secrets Vulnerability (bruteforce the secret)

	  - Created a custom cookie session middleware that validates vulnerable cookies

	  - Implemented 3 modes of difficulty:

	    1. EASY: Exploit cookie session vulnerability

	    2. MED: Exploit JWT vulnerability

	    3. HARD: Exploit JWT + cookie session vulnerability

3. Man in the Middle 

   - OPCUA communications does not use SSL to encrypt traffic

   - Use wireshark and obtain the relevant information to attack the water plant (e.g. DoS, manipulating the server)
