/*global require, module, process*/
'use strict';

module.exports.checkEnv = (required) => {
    const missingProps = [];
    const config = {};

    required.forEach((prop) => {
        const envName = `CERTAUTH_${prop.toUpperCase()}`;
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
