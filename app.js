'use strict';

const AWS = require('aws-sdk');
const request = require('request');

suicide();

function suicide() {
  return getInstanceId()
    .then(instanceId => {
      return Object.assign({}, {instanceId: instanceId})
    })
    .then(workspace => {
      return getRegion()
        .then(region => {
          return Object.assign(workspace, {region: region})
        })
    })
    .then(workspace => {
      AWS.config.update({region: workspace.region});
      let params = {
        InstanceIds: [
          workspace.instanceId
        ]
      }
      return new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
        ec2.terminateInstances(params, function(err, data) {
          if (err) return reject(err) // an error occurred
          else {
            console.log(`Shutting down ${workspace.instanceId}`);
            return resolve(data);
          }
        });
      })
    })
}

function getInstanceId() {
  return new Promise((resolve, reject) => {
    return request('http://169.254.169.254/latest/meta-data/instance-id', (err, res, body) => {
      if (err) return reject(err);
      return resolve(body)
    })
  })
}

function getRegion() {
  return new Promise((resolve, reject) => {
    return request('http://169.254.169.254/latest/meta-data/placement/availability-zone', (err, res, body) => {
      if (err) return reject(err);
      let region = body.substring(0, body.length - 1)
      return resolve(region)
    })
  })
}

