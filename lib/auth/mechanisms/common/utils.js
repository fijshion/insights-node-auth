/*global require, module, process*/
'use strict';

module.exports.checkEnv = (prefix, required) => {
    const missingProps = [];
    const config = {};

    required.forEach((prop) => {
        const envName = `${prefix}_${prop.toUpperCase()}`;
        const envProp = process.env[envName];


        if (!envProp || envProp.trim() === '') {
            missingProps.push(envName);
        }

        config[prop] = envProp;
    });

    return {
        config: config,
        missing: missingProps
    };
};
