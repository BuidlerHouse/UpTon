from telegram import Update, MenuButtonWebApp, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters
import os
import asyncio
import random

BOT_TOKEN = os.getenv("BOT_TOKEN")

async def hello(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Print sender ID and group ID
    sender_id = update.effective_user.id
    chat_id = update.effective_chat.id
    print(f"Sender ID: {sender_id}")
    print(f"Chat/Group ID: {chat_id}")
    
    # Random replies
    replies = [
        f'Hello {update.effective_user.first_name}!',
        f'Hi there {update.effective_user.first_name}!', 
        f'Greetings {update.effective_user.first_name}!',
        f'Hey {update.effective_user.first_name}, nice to meet you!',
        f'Welcome {update.effective_user.first_name}!'
    ]
    
    # If message is a reply or mentions the bot
    if update.message.reply_to_message or update.message.entities:
        await update.message.reply_text(random.choice(replies))

async def handle_mention(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Random replies for mentions
    replies = [
        f'Yes, {update.effective_user.first_name}?',
        f'I\'m here, {update.effective_user.first_name}!',
        f'You called, {update.effective_user.first_name}?',
        f'At your service, {update.effective_user.first_name}!'
    ]
    await update.message.reply_text(random.choice(replies))

loop = asyncio.get_event_loop()
if not loop.is_running():
    asyncio.set_event_loop(loop)
app = ApplicationBuilder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler("hello", hello))
app.add_handler(MessageHandler(filters.Entity("mention") | filters.REPLY, handle_mention))
print("Bot is running")
app.run_polling()