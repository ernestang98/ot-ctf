from signal import signal, SIGTERM, SIGHUP, pause
from time import sleep, time
from threading import Thread
from gpiozero import DistanceSensor
import RPi.GPIO as GPIO
 
import time
import sys
import os
from opcua import Server
 
 
class OPCUAController:
    def __init__(self, url):
        self.url = url
        self.server = Server()
        self.node = None
        self.namespaces = {}
        self.object_map = {}
        self.param_node_map = {}
 
    def set_up(self):
        self.server.set_endpoint(self.url)
        self.node = self.server.get_objects_node()
 
    def add_namespace(self, name):
        self.namespaces[name] = self.server.register_namespace(name)
 
    def add_object(self, namespace, object_name):
        if namespace in self.namespaces:
            self.object_map[object_name] = self.node.add_object(self.namespaces[namespace], object_name)
 
    def add_param_node(self, namespace, object_name, param_node_name, param_node_value):
        if (object_name in self.object_map) and (namespace in self.namespaces):
            self.param_node_map[param_node_name] = self.object_map[object_name].add_variable(self.namespaces[namespace], param_node_name, param_node_value)
        

    def get_param_node(self, param_node_name):
    	if param_node_name in self.param_node_map:
            return self.param_node_map[param_node_name]
    
    def set_param_node_writeable(self, param_node_name):
        if param_node_name in self.param_node_map:
            self.param_node_map[param_node_name].set_writable()


class GPIOController:
    def __init__(self):
        self.Trigger = 21
        self.Echo = 26
        self.reading = True
        self.sensor = DistanceSensor(echo=self.Echo, trigger=self.Trigger)
        self.Valve =16
        self.Valve2 = 12
        self.Pump = 20

#manual calculations of distance
############################################
    def distance(self):
        GPIO.output(self.Trigger,True)
        sleep(0.00001)
        GPIO.output(self.Trigger,False)
        while GPIO.input(self.Echo) == 0:
            StartTime = time()
        while GPIO.input(self.Echo) == 1:
            StopTime = time()
        TimeElapsed = StopTime - StartTime
        dist = (TimeElapsed*34300)/2
        return dist
    def reading_dist(self):
        while self.reading:
            dist = self.distance()
        print(f"Distance: {dist}cm")
        sleep(1)
#############################################
    def set_up(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.Valve,GPIO.OUT)
        GPIO.setup(self.Valve2,GPIO.OUT)
        GPIO.setup(self.Pump,GPIO.OUT)
    def pump_on(self):
        GPIO.output(self.Pump,GPIO.LOW)
        print("Pump ON")
	 
    def pump_off(self):
        GPIO.output(self.Pump,GPIO.HIGH)
        print("Pump OFF")

    def valve_on(self):
        GPIO.output(self.Valve,GPIO.HIGH)
        print("Valve ON")

    def valve_off(self):
        GPIO.output(self.Valve,GPIO.LOW)
        print("Valve OFF")

    def valve2_on(self):                 
        GPIO.output(self.Valve2, GPIO.LOW)
        print("Valve2 ON")

    def valve2_off(self):
        GPIO.output(self.Valve2, GPIO.HIGH)
        print("Valve2 OFF")


"""
state: 0|1, whether or not the tank is full
num:  The ultrasonic sensor HC SR04 have a frequency of 40hz, so max it can only take 40 readings in 1 second.
height_of_tank: Height of tank in cm
stopping_dist: When the water level is 4cm from the sensor, we will consider it as full
...
"""
class WaterPlantController:
    def __init__(self, gpioClient):
        self.state = 0
        self.num = 40
        self.height_of_tank = 22  
        self.stopping_dist = 4  
        self.max_height_of_water = self.height_of_tank - self.stopping_dist
        self.height_of_empty_space = gpioClient.sensor.value*100 - self.stopping_dist 
        self.height_of_water = 1- self.height_of_empty_space/self.max_height_of_water 
        self.waterlvl = int(self.height_of_water * 100)  
        self.level = int(self.waterlvl - (self.waterlvl % 5))


URL = "opc.tcp://10.12.1.56:4840"
NAMESPACE = "OPCUA_RPI_SERVER"
OBJECT_NAME = "Parameters"

PUMP_NODE = "pump"
VALVE_NODE_1 = "valve 1"
VALVE_NODE_2 = "valve 2"
WATER_LEVEL_NODE = "waterlevel"
AUTOPILOT_NODE = "autoPilot"
GATE_NODE = "gate"
 
opcua = OPCUAController(URL)
opcua.set_up()
opcua.add_namespace(NAMESPACE)
opcua.add_object(NAMESPACE, OBJECT_NAME)
opcua.add_param_node(NAMESPACE, OBJECT_NAME, PUMP_NODE, float(0))
opcua.add_param_node(NAMESPACE, OBJECT_NAME, VALVE_NODE_1, float(0))
opcua.add_param_node(NAMESPACE, OBJECT_NAME, GATE_NODE, float(0))
opcua.add_param_node(NAMESPACE, OBJECT_NAME, WATER_LEVEL_NODE, float(0))
opcua.add_param_node(NAMESPACE, OBJECT_NAME, AUTOPILOT_NODE, float(0))
opcua.add_param_node(NAMESPACE, OBJECT_NAME, VALVE_NODE_2, float(0))
opcua.set_param_node_writeable(PUMP_NODE)
opcua.set_param_node_writeable(VALVE_NODE_1)
opcua.set_param_node_writeable(GATE_NODE)
opcua.set_param_node_writeable(WATER_LEVEL_NODE)
opcua.set_param_node_writeable(AUTOPILOT_NODE)
opcua.set_param_node_writeable(VALVE_NODE_2)
opcua.server.start()
print("server started at {}".format(URL))



gpio = GPIOController()
gpio.set_up()

waterplant = WaterPlantController(gpio)

"""
Function used to return the correct Level state (State machine) used to fix jitter of waterlevel reading from HCS04 
By right the 'level' variable should be in multiple of 5 only. 
"""
def set_water_level_in_opcua(level, waterlvl, waterNode):
    '''
    If level is <=0, if waterlvl<7, set level and server waterlvl as 0 else set level and server waterlvl as 5
    '''
    if level <= 0:                    
        if waterlvl < 0+7:
            waterNode.set_value(float(0))
            return 0
        else:
            waterNode.set_value(float(5))
            return 5
        
    #If level == 5, if waterlvl < 0, set level and server waterlvl as 0, elif waterlvl <12, set level and server waterlvl as 5, else set level and waterlvl as 10
        
    elif level == 5:
        if waterlvl < level-5:  
            waterNode.set_value(float(level-5))
            return level-5
        elif waterlvl < level+ 7:
            waterNode.set_value(float(level))
            return level
        else:
            waterNode.set_value(float(level+5))
            return level+5
    
    #If level >=100, if waterlvl <93, set level and server waterlvl as 95, else set level and server waterlvl as 100
    
    elif level >= 100:                   
        if waterlvl < 100-7:
            waterNode.set_value(float(95))
            return 95
        else:
            waterNode.set_value(float(100))
            return 100

    #if waterlvl < level-7, set level and server waterlvl as (level-5), elif waterlvl < level+7 set level and server waterlvl as level, else set level and server waterlvl as (level+5)

    else:
        if waterlvl < level-7:         
            waterNode.set_value(float(level-5))
            return level - 5
 
        elif waterlvl < level+7:
            waterNode.set_value(float(level))
            return level
 
        else:
            waterNode.set_value(float(level+5))
            return level +5


def set_state_and_valves_values_and_pump_values(opcuaClient, valve_2, valve_1, pump, final_state):
    opcuaClient.get_param_node(VALVE_NODE_2).set_value(float(valve_2))
    opcuaClient.get_param_node(VALVE_NODE_1).set_value(float(valve_1))
    opcuaClient.get_param_node(PUMP_NODE).set_value(float(pump))
    return final_state


def get_average_reading(number_of_times_to_poll_value, sensor_value):
    total = 0
    for i in range(number_of_times_to_poll_value):
        total += sensor_value
        sleep(0.025)
    avg = total/number_of_times_to_poll_value*100

    return "{:.2f}".format(avg) ,avg 


def set_opcua_client_and_gpio_client(opcuaClient, gpioClient):
    if (opcuaClient.get_param_node(PUMP_NODE).get_value()==1) and (opcuaClient.get_param_node(VALVE_NODE_1).get_value()==1):
        opcuaClient.get_param_node(GATE_NODE).set_value(float(1))
    else:
        opcuaClient.get_param_node(GATE_NODE).set_value(float(0))

    if opcuaClient.get_param_node(PUMP_NODE).get_value() == 1:
        gpioClient.pump_on()
    else:
        gpioClient.pump_off()

    if opcuaClient.get_param_node(VALVE_NODE_1).get_value() == 1:
        gpioClient.valve_on()
    else:
        gpioClient.valve_off()

    if opcuaClient.get_param_node(VALVE_NODE_2).get_value()==1:
        gpioClient.valve2_on()
    else:
        gpioClient.valve2_off()


def read_dist(opcuaClient, gpioClient, waterplantClient):
    opcuaClient.get_param_node(AUTOPILOT_NODE).set_value(float(1))

    while gpioClient.reading:
        dist,avg = get_average_reading(waterplantClient.num, gpioClient.sensor.value)
        waterlvl = int(100- ((avg-4)/18 * 100))
        p = opcuaClient.get_param_node(PUMP_NODE).get_value()
        v = opcuaClient.get_param_node(VALVE_NODE_1).get_value()
        v2 = opcuaClient.get_param_node(VALVE_NODE_2).get_value()
        g = opcuaClient.get_param_node(GATE_NODE).get_value()
        w = opcuaClient.get_param_node(WATER_LEVEL_NODE).get_value()
        a = opcuaClient.get_param_node(AUTOPILOT_NODE).get_value()
        print("Distance: " + dist + " cm")
        print(f"waterlvl: {waterlvl}")
        print(f"p:{p}, v:{v}, v2:{v2}, g:{g}, w:{w}, a:{a}")
        
        waterplant.level = set_water_level_in_opcua(waterplant.level, waterlvl, opcuaClient.get_param_node(WATER_LEVEL_NODE)) ### write to server and set correct machine state
        
        if opcuaClient.get_param_node(AUTOPILOT_NODE).get_value() == 1:                   ### when autopilot, automatically set server values, else don't do anything
            if waterplantClient.state == 0:  ### when notFull, check server waterlvl, if waterlvl <100, on pump and valve and set state to be notFull, else off pump and valve and set state to be Full
                if opcuaClient.get_param_node(WATER_LEVEL_NODE).get_value() < 100:
                    waterplantClient.state = set_state_and_valves_values_and_pump_values(opcuaClient,0,1,1,0)
                else:
                    waterplantClient.state = set_state_and_valves_values_and_pump_values(opcuaClient,1,0,0,1)
            elif waterplantClient.state == 1:
                if opcuaClient.get_param_node(WATER_LEVEL_NODE).get_value() <= 20:  ### when full, check server waterlvl, if waterlvl <=20, on pump and valve and set state to notFull, else off pump and valve and set state to be notFull
                    waterplantClient.state = set_state_and_valves_values_and_pump_values(opcuaClient,0,1,1,0)
                else:
                    waterplantClient.state = set_state_and_valves_values_and_pump_values(opcuaClient,1,0,0,1)

        set_opcua_client_and_gpio_client(opcuaClient, gpioClient)
 
def safe_exit(signum,frame):
    exit(1)
 
signal(SIGTERM, safe_exit)
signal(SIGHUP, safe_exit)
 
try:
    reader = Thread(target=read_dist, args=(opcua, gpio, waterplant), daemon= True) ### run the program as thread, set daemon as true so that when the parent process is killed, the child is killed as well
    reader.start()
    pause()
except KeyboardInterrupt:
    print('Interrupted')
    try:
        sys.exit(0)
    except SystemExit:
        os._exit(0)
finally:
    reading = False
    sensor.close()
 
 