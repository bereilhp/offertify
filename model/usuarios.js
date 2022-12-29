const uuid = require('uuid');

const User = class User {
    constructor(uuid, name, hash) {
        this.uuid = uuid;
        this.name = name;
        this.hash = hash;
        this.rol = undefined;
    }
};

const Client = class Client extends User {
    constructor(uuid, name, hash) {
        super(uuid, name, hash)
        this.rol = 'user';
    }
};

const Owner = class Owner extends User {
    constructor(uuid, name, hash) {
        super(uuid, name, hash)
        this.rol = 'owner';
    }
};

const Admin = class Admin extends User {
    constructor(uuid, name, hash) {
        super(uuid, name, hash)
        this.rol = 'admin';
    }
};

function userFactory(name, hash, rol, userId = null) {
    userId = userId ?? uuid.v4();
    switch(rol) {
        case 'user':
            return new Client(userId, name, hash);
        case 'owner':
            return new Owner(userId, name, hash);
        case 'admin':
            return new Admin(userId, name, hash);
        default:
            return null;
    }
}

module.exports = {
    User,
    Client,
    Owner,
    Admin,
    userFactory
}