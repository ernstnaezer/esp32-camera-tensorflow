Import("env")
import os

config = []

with open('./wifi_secrets.txt', 'r') as reader:
    line = reader.readline()
    while line != '':  # The EOF char is an empty string

        if line.startswith( '#' ) == False or line == '\n'  == False:
            parts = line.rstrip().split("=")  
            config.append( parts )

        line = reader.readline()

env.Append(CPPDEFINES=
    config
)
