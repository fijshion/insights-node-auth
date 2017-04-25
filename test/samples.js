/*global module*/

const pub = {
    account_number: '12345',
    org_id: '54321',
    locale: 'en_US',
    sso_username: 'bob-loblaws-law-blog',
    email: 'bobloblaw@example.com',
    firstName: 'Bob',
    lastName: 'Lowlaw',
    timezone: 'America/Los_Angeles',
    company: 'Bob Loblaw Attourney At Law',
    phoneNumber: '000.000.0000',
    address: {
        street: 'Bob Lane',
        county: 'ORANGE',
        country_code: 'US',
        po_box: false,
        postal_code: '92663',
        state: 'CA',
        city: 'NEWPORT BEACH'
    }
};

module.exports.pub = pub;

module.exports.smwBasicUserObject = {
    roles: [
        { group: 'cloud_access_1', roles: [ 'ADMIN' ] },
        { group: 'admin:org:all', roles: [ 'ADMIN' ] },
        { group: 'cservice', roles: [ 'USER' ] },
        { group: 'redhat:employees', roles: [ 'USER' ] }
    ],
    id: 5299389,
    login: pub.sso_username,
    loginUppercase: pub.sso_username.toUpperCase(),
    password: null,
    active: true,
    oracleContactId: null,
    orgId: pub.org_id,
    contactPermissions: {
        allowEmailContact: false,
        allowFaxContact: false,
        allowMailContact: false,
        allowPhoneContact: false,
        allowThirdPartyContact: false
    },
    personalInfo: {
        company: pub.company,
        firstName: pub.firstName,
        greeting: 'Mr.',
        lastName: pub.lastName,
        suffix: null,
        title: null,
        email: pub.email,
        emailConfirmed: true,
        phoneNumber: pub.phoneNumber,
        faxNumber: null,
        locale: pub.locale,
        timeZone: { name: pub.timeZone, rawOffset: -28800000 },
        department: null
    },
    personalSite: null,
    customer: {
        id: pub.orgId,
        name: pub.company,
        password: null,
        creditApplicationCompleted: false,
        customerType: 'B',
        oracleCustomerNumber: pub.account_number,
        namedAccount: false,
        createdDate: 1031342012000,
        updatedDate: 1485798648944
    },
    createdDate: 1233334484000,
    updatedDate: 1485798525623,
    system: null,
    userType: null

};

module.exports.keycloakJwtUserObject = {
    jti: '02729fd0-ed5f-4c86-9e32-11b26d564fds',
    exp: 1493740224,
    nbf: 0,
    iat: 1493739924,
    iss: 'https://sso.redhat.com/auth/realms/redhat-external',
    aud: 'customer-portal',
    sub: '9sdf1fdsfsdc-b593-4530-9428-7e7de3a9c65d',
    typ: 'Bearer',
    azp: 'customer-portal',
    session_state: 'fdsfs5e-7c62-4851-9a5d-e9a8fd0efdsfs',
    client_session: 'fdsfsdffd44-409a-482d-b57f-2b48fdsfs95f3',
    'allowed-origins': [
        'https://access.us.redhat.com',
        'https://hardware.redhat.com',
        'https://prod.foo.redhat.com:1337',
        'https://rhn.redhat.com',
        'https://www.redhat.com',
        'https://prod-mclayton.usersys.redhat.com',
        'https://access.redhat.com'
    ],
    realm_access: {
        roles: [
            'authenticated',
            'redhat:employees',
            'idp_authenticated',
            'portal_manage_subscriptions',
            'admin:org:all',
            'cservice',
            'portal_manage_cases',
            'portal_system_management',
            'cloud_access_1',
            'portal_download'
        ]
    },
    resource_access: {},
    REDHAT_LOGIN: pub.sso_username,
    lastName: pub.lastName,
    country: pub.address.country_code,
    account_number: pub.account_number,
    employeeId: pub.sso_username,
    firstName: pub.firstName,
    account_id: pub.org_id,
    user_id: '59fdsf',
    organization_id: '0fsdfsdsdf000116C',
    siteId: 'redhat',
    siteID: 'redhat',
    portal_id: '0fdsfsd',
    lang: pub.locale,
    region: pub.address.country_code,
    RHAT_LOGIN: pub.sso_username,
    email: pub.email,
    username: pub.sso_username,
    DONT_CACHE: true
};

module.exports.strataUserObject = {
    created_date: 1233334484000,
    last_modified_date: 1485798525623,
    account_number: pub.account_number,
    is_active: true,
    company: pub.company,
    phone_number: pub.phoneNumber,
    id: '98765',
    first_name: pub.firstName,
    last_name: pub.lastName,
    org_id: pub.org_id,
    email: pub.email,
    last_logged_in_date: 1484697600000,
    preferred_language: pub.locale,
    greeting: 'Mr.',
    timezone: pub.timezone,
    locale: pub.locale,
    org_admin: true,
    is_entitled: true,
    has_chat: false,
    rights: {
        right: [
            { name: 'AllowEmailContact', has_access: false },
            { name: 'AllowFaxContact', has_access: false },
            { name: 'AllowMailContact', has_access: false },
            { name: 'AllowPhoneContact', has_access: false },
            { name: 'AllowThirdPartyContact', has_access: false },
            { name: 'portal_manage_cases',
              description: 'Customer Portal: Manage Support Cases',
              has_access: true },
            { name: 'portal_manage_subscriptions',
              description: 'Customer Portal: Manage Subscriptions',
              has_access: true },
            { name: 'portal_download',
              description: 'Customer Portal: Download Software and Updates',
              has_access: true },
            { name: 'portal_system_management',
              description: 'Customer Portal: System Management',
              has_access: true },
            { name: 'cloud_access_1', role: [ 'Admin' ] },
            { name: 'redhat:employees', role: [ 'User' ] },
            { name: 'admin:org:all', role: [ 'Admin' ] },
            { name: 'cservice', role: [ 'User' ] }
        ]
    },
    is_internal: true,
    address: {
        address1: pub.address.street,
        county: pub.address.county,
        country_code: pub.address.country_code,
        po_box: pub.address.po_box,
        postal_code: pub.address.postal_code,
        state: pub.address.state,
        city: pub.address.city
    },
    can_add_attachments: true,
    can_access_all_accounts: true,
    is_secure_support_tech: false,
    ever_entitled: true,
    sso_username: pub.sso_username
};
