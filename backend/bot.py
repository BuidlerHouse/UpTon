from telegram import Update, MenuButtonWebApp, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import os
import asyncio

web_app_url = 'https://192.168.86.34:5173/'

async def hello(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f'Hello {update.effective_user.first_name}')

async def set_web_app_button(application):
    button = MenuButtonWebApp(
        text="PUMP",
        web_app=WebAppInfo(url=web_app_url)
    )
    await application.bot.set_chat_menu_button(menu_button=button)

async def start(update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [[InlineKeyboardButton("PUMP IT", web_app=WebAppInfo(url=web_app_url))]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('Welcome to UpTon💰💰', reply_markup=reply_markup)


loop = asyncio.get_event_loop()
if not loop.is_running():
    asyncio.set_event_loop(loop)
app = ApplicationBuilder().token(os.getenv("BOT_TOKEN")).build()
loop.run_until_complete(set_web_app_button(app))
app = ApplicationBuilder().token(os.getenv("BOT_TOKEN")).build()
app.add_handler(CommandHandler("hello", hello))
app.add_handler(CommandHandler("start", start))
print("Bot is running")
app.run_polling()