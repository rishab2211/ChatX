export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts : [],
  channels:[],
  setChannels:(channels)=>set({channels}),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts)=>
    set({directMessagesContacts}),
  closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
    }),
    addChannel: (channel) => {
      const channels = get().channels;
      set({ channels: [channel, ...channels] });
  },
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,

          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,

          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
  addChannelInChannelList :(message)=>{
    console.log("inside add channel in channel list");
    
    const channels = get().channels;
    console.log(message);
    
    const data =channels.find((channel)=>channel._id===message.channelId);
    const index = channels.findIndex((channel)=>channel._id===message.channelId);
    if(index!==-1 && index!==undefined){
      channels.splice(index,1);
      channels.unshift(data);
    }
    set({channels : [...channels]})
  },

  addContactsInDMContact:(message)=>{
    const userId = get().userInfo.id;
    const formId = message.sender._id===userId?
    message.recipient._id:
    message.sender._id;

    const formData= message.sender._id === userId? message.recipient: message.sender;
    const dmContacts = get().directMessagesContacts;

    const data= dmContacts.find((contact)=> contact._id===formId);
    const index = dmContacts.findIndex((contact)=>contact._id===formId);
    if(index!==-1 && index!==undefined){
      dmContacts.splice(index,1);
      dmContacts.unshift(data);
    }else{
      dmContacts.unshift(formData);
    }

    set({directMessagesContacts : dmContacts})
  }
});