# OPCUA Server

Server code to be ran on the RPi controlling the waterplant. Wiring can be found in [diagram.jpeg](./diagram.jpeg). RPi can control the water pump, the valves and the gates of the waterplant. This code also records the water level of the waterplant and the various states of the motors of the waterplant (i.e. whether or not the valves/gates/pump are active or inactive).

### Installation:

```
pip3 install -r requirements.txt
python3 server.py
```

