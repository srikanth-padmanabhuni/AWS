const {v4: UUID} = require('uuid');
module.exports.getUuid = () => {
    const uuid = UUID();
    return uuid;
}