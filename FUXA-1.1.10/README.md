# Vulnerable Operational Technology System

Purpose of this project is to provide a training facility to educate red team on ethical operational technology hacking.

### Components:

1. Open-sourced [FUXA](https://github.com/frangoteam/FUXA) with vulnerabilities connected to RPI's OPUCA server

2. RPI functioning as OPCUA server and also controlling water plant via GPIO

3. Water Plant 

4. Open-sourced [OPCUA Client](https://github.com/FreeOpcUa/opcua-client-gui) for visualising water level of water plant

### Vulnerabilities:

1. Sensitive Data Leakage

  - Edited authentication and creation of new accounts code to exclude bcrypt hashing
  
  - Edited the query user API to disable need for authentication to view user data  
  
  - Edited the signin user API to disable need for authentication to perform SQL injection to leak user data

2. Broken Authenentication

  - Edited jsonwebtoken library to allow for vulnerabilities in JWT token

    1. None Algorithm Vulnerability

    2. Key Confusion Vulnerability
    
    3. Weak JWT secrets Vulnerability

  - Created a custom cookie session middleware that validates vulnerable cookies

  - Implemented 3 modes of difficulty:

    1. EASY: Exploit cookie session vulnerability

    2. MED: Exploit JWT vulnerability

    3. HARD: Exploit JWT + cookie session vulnerability

3. Man in the Middle 

   - OPCUA Communications does not use SSL to encrypt traffic

   - Perform a MiTM attack using wireshark and obtain the relevant information to attack the water plant (e.g. DoS, manipulating the server)
