const User = class User {
    constructor(uuid, name, hash) {
        this.uuid = uuid;
        this.name = name;
        this.hash = hash;
        this.rol = undefined;
    }
};

const Client = class Client extends User {
    
};

const Owner = class Owner extends User {
    
};

const Admin = class Admin extends User {
    
};

module.exports = {
    User,
    Client,
    Owner,
    Admin
}