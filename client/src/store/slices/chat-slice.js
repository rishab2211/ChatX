export const createChatSlice = (set, get) => ({
  // --- STATE PROPERTIES ---

  // Stores the type of the currently selected chat: 'contact' (for DMs) or 'channel'.
  selectedChatType: undefined,
  // Stores the complete data object for the selected user or channel.
  selectedChatData: undefined,
  // Holds an array of all messages for the currently open chat.
  selectedChatMessages: [],
  // Holds an array of all users the current user has had direct messages with.
  directMessagesContacts: [],
  // Holds an array of all channels the user is a part of.
  channels: [],



  // --- ACTIONS (functions to update state) ---

  //Replaces the entire list of channels with a new array of channel objects.
  setChannels: (channels) => set({ channels }),


  //Sets the type of the currently selected chat, which can be 'contact' or 'channel'.
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),


  //  Sets the data for the currently selected chat using a user or channel object.
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),


  //  Replaces the messages for the currently selected chat with a new array of messages.
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),


  // Replaces the list of direct message contacts with a new array of user objects.
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),


  // Resets the selected chat state, effectively closing the current chat view.
  closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
    }),

  //  Adds a new channel object to the beginning of the channels list.
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },


  //  Adds a new message object to the currently active chat's message list.
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    // Normalizes sender/recipient fields to ensure they are stored as IDs.
    // This handles cases where the incoming socket message might have populated objects.
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
            selectedChatType === "channel" ? message.sender : message.sender._id,
        },
      ],
    });
  },

  /**
   * Moves a channel to the top of the list when a new message is received for it.
   * This is based on the incoming message object containing the channelId.
   */
  addChannelInChannelList: (message) => {
    const channels = get().channels;

    const data = channels.find((channel) => channel._id === message.channelId);
    const index = channels.findIndex(
      (channel) => channel._id === message.channelId
    );

    // If the channel is found, remove it from its current position and add it to the top.
    if (index !== -1 && index !== undefined) {
      channels.splice(index, 1);
      channels.unshift(data);
    }
    set({ channels: [...channels] });
  },

  /**
   * Moves a DM contact to the top of the list when a new message is received.
   * If the contact doesn't exist in the list, it adds them.
   * This is based on the incoming message object from the sender/recipient.
   */
  addContactsInDMContact: (message) => {
    const userId = get().userInfo.id;
    // Determine who the "other person" in the conversation is.
    const formId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;

    const formData =
      message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;

    const index = dmContacts.findIndex((contact) => contact._id === formId);

    // If contact already exists, move them to the top of the list.
    if (index !== -1) {
      const data = dmContacts.find((contact) => contact._id === formId);
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      // If it's a new contact, add them to the top of the list.
      dmContacts.unshift(formData);
    }

    set({ directMessagesContacts: [...dmContacts] });
  },
});