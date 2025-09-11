#Pull Ubuntu 24.04 as base image
FROM ubuntu:24.04

#Install Java & other dependencies
RUN apt-get update -y &&\
    apt-get install -y software-properties-common jq unzip curl gnupg gpg default-jdk

#Install Git
RUN add-apt-repository ppa:git-core/ppa &&\
    apt update -y &&\
    apt install -y git

#Install Node.js
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update -y && \
    apt-get install -y nodejs curl unzip git default-jdk

#Install Salesforce CLI & plugins
RUN npm install @salesforce/cli --global
RUN echo y | sf plugins install @salesforce/sfdx-scanner
RUN echo y | sf plugins install sfdx-git-delta
RUN sf plugins
RUN export PATH=$PATH:/usr/local/bin 

#Give docker & root users ability to execute all installed tools
RUN chmod -R go+rwx ${HOME} &&\
    chmod -R go+rwx /root
