import asyncio
from telethon import TelegramClient
from telethon.tl.types import Channel, ChatAdminRights
from telethon.tl.functions.channels import CreateChannelRequest, EditAdminRequest
from telethon.tl.functions.messages import AddChatUserRequest
import random
from telethon.tl.functions.channels import InviteToChannelRequest
from telethon.errors import BadRequestError
import traceback

# Your API ID and API Hash
API_ID = ''
API_HASH = ''
PHONE = ''  # Your phone number used to log in (+1xxxxx)
BOT_USERNAME = ''  # The username of the bot to be added
# This bot must be public

# Create a new client instance
client = TelegramClient('session_name', API_ID, API_HASH)

async def main():
    await client.start()
    bot_entity = await client.get_entity(BOT_USERNAME)
    bot_id = bot_entity.id
    # print(bot_entity)
    # exit()
    # Create a new channel
    result = await client(CreateChannelRequest(
        title='My New Channel' + str(random.randint(1, 10000)),
        about='This is a channel created by Telethon.',
        megagroup=True,  # Set to True if you want to create a supergroup
    ))
    # print(result.stringify())
    channel = result.chats[0]  # The created channel object
    print(f'Channel created: {channel.title} (ID: {channel.id})')
    # print(f'Channel link: https://t.me/{channel.username}')
    # Add the bot to the channel
    try:
        await client(InviteToChannelRequest(
            channel=channel,
            users=[bot_entity]
        ))
        print(f'Bot {BOT_USERNAME} added to the channel.')
        # Only promote to admin if invite succeeded
        rights = ChatAdminRights(
            change_info=True,
            post_messages=True,
            edit_messages=True,
            delete_messages=True,
            pin_messages=True,
            ban_users=True
        )
        try:
            await client(EditAdminRequest(
                channel=channel.id,
                user_id=bot_id,
                admin_rights=rights,
                rank='Bot Admin'  # Optional rank/title for the admin
            ))
        except BadRequestError:
            print(traceback.format_exc())
    except Exception as e:
        print(f"spam protection: {str(e)}")
    except BadRequestError:
        print(traceback.format_exc())
    print(f'Bot {BOT_USERNAME} promoted to admin.')
# Run the client
asyncio.run(main())
