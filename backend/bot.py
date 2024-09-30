from telegram import Update, MenuButtonWebApp, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters
import os
import asyncio
from PIL import Image
import io

web_app_url = 'https://192.168.86.34:5173/'
BOT_TOKEN = os.getenv("BOT_TOKEN")

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

async def add_sticker(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("Please provide a symbol for the sticker set.")
        return

    symbol = context.args[0].upper()
    user = update.effective_user
    sticker_set_name = f"{symbol}_by_{context.bot.username}"

    await update.message.reply_text("Please send the image for the sticker.")
    context.user_data.update({
        'symbol': symbol,
        'sticker_set_name': sticker_set_name,
        'waiting_for_image': True
    })

async def process_sticker_image(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.user_data.get('waiting_for_image') and (update.message.document or update.message.photo):
        file_id = update.message.document.file_id if update.message.document else update.message.photo[-1].file_id
        
        context.user_data.update({
            'sticker_file_id': file_id,
            'waiting_for_image': False,
            'waiting_for_emoji': True
        })
        await update.message.reply_text("Image received! Now send the emoji for this sticker.")

async def get_stickers(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.message.reply_text("Please provide a symbol for the sticker set.")
        return

    symbol = context.args[0].upper()
    sticker_set_name = f"{symbol}_by_{context.bot.username}"

    try:
        sticker_set = await context.bot.get_sticker_set(name=sticker_set_name)
        sticker_url = f"https://t.me/addstickers/{sticker_set_name}"
        await update.message.reply_text(f"Sticker set for {symbol} found!\n\nClick here to add it to your account: {sticker_url}")
    except Exception as e:
        await update.message.reply_text(f"No sticker set found for {symbol}. Error: {str(e)}")

async def process_sticker_emoji(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.user_data.get('waiting_for_emoji'):
        emoji = update.message.text
        if len(emoji) != 1:
            await update.message.reply_text("Please send a single emoji.")
            return

        user = update.effective_user
        sticker_set_name = context.user_data['sticker_set_name']
        sticker_file_id = context.user_data['sticker_file_id']

        try:
            await context.bot.add_sticker_to_set(
                user_id=user.id,
                name=sticker_set_name,
                sticker={"sticker": sticker_file_id, "emoji_list": [emoji], "format": "static"}
            )
            await update.message.reply_text(f"Sticker added to {sticker_set_name}.")
        except Exception as e:
            try:
                await context.bot.create_new_sticker_set(
                    user_id=user.id,
                    name=sticker_set_name,
                    title=f"{context.user_data['symbol']} Sticker Set",
                    stickers=[{"sticker": sticker_file_id, "emoji_list": [emoji], "format": "static"}]
                )
                await update.message.reply_text(f"New sticker set created: {sticker_set_name}.")
            except Exception as e:
                await update.message.reply_text(f"Error creating sticker set: {str(e)}")

        context.user_data.clear()

loop = asyncio.get_event_loop()
if not loop.is_running():
    asyncio.set_event_loop(loop)
app = ApplicationBuilder().token(BOT_TOKEN).build()
loop.run_until_complete(set_web_app_button(app))
app.add_handler(CommandHandler("hello", hello))
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("add_sticker", add_sticker))
app.add_handler(CommandHandler("get_stickers", get_stickers))
app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, process_sticker_image))
app.add_handler(MessageHandler(filters.TEXT, process_sticker_emoji))
print("Bot is running")
app.run_polling()