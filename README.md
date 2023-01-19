# Vulnerable Operational Technology System

Purpose of this project is to provide a training facility to educate red team on ethical operational technology hacking.

### Components:

1. Open-sourced [FUXA](https://github.com/frangoteam/FUXA) with vulnerabilities connected to RPI's OPUCA server

2. Open-sourced [OPCUA Client](https://github.com/FreeOpcUa/opcua-client-gui) for visualising data read by sensors of the RPI

2. RPI functioning acts as a PLC and an OPCUA server, reading data from sensors (GPIO) and controlling water plant (GPIO) while relaying the information to OPCUA Client and FUXA HMI

3. Physical mini water plant set up

### References

1. [OT Jargons - HMI, SCADA, PLC, DCS](http://dcs-news.com/plc-dcs-scada-hmi-differences)

2. [OT vs IT Protocols](https://www.rtautomation.com/rtas-blog/the-it-ot-network-divide/)

3. [OPCUA - Connect between OT & IT](https://opcconnect.opcfoundation.org/2021/12/it-ot-convergence-opc-ua-more-than-just-another-protocol/)

