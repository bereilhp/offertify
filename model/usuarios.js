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

module.exports = {
    User,
    Client,
    Owner,
    Admin
}