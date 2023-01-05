const chats = require('../../model/chats');
const Chat = chats.Chat;
const chatFactory = chats.chatFactory;


test('Chat tiene uuid', () => {
    const uuid = 'id';
    const mensajes = 'Mensaje';
    const chat = new Chat(uuid, mensajes);
    expect(chat.uuid).toBe(uuid);
})

test('Chat tiene uuid', () => {
    const uuid = 'id';
    const mensajes = 'Mensaje';
    const chat = new Chat(uuid, mensajes);
    expect(chat.mensajes).toBe(mensajes);
})

test('chatFactory() crea Chats', () => {
    const chat = chatFactory("Soy un Mensaje");
    expect(chat).toBeInstanceOf(Chat);
});

test('chatFactory() crea uuids diferentes para cada chat', () => {
    const chat_1 = chatFactory("Soy un Mensaje");
    const chat_2 = chatFactory("Soy un Mensaje");
    expect(chat_1.uuid).not.toEqual(chat_2.uuid);
});    

test('chatFactory crea uuid sólo si no se especifica', () => {
    const chat = chatFactory("Soy un Mensaje", 'id');
    expect(chat.uuid).toBe('id');
});