'use strict';

const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')

const aboutMenuItemID = 'aboutMenuItemID';
const hideMessageMenuItemID = 'hide-message-menu-item';
const readMessageMenuItemID = 'read-message-menu-item';
const sendImageMenuItemID = 'sendImageMenuItemID';

let mainWindow = undefined;
let aboutWindow = undefined;
let mainMenu = undefined;

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  mainWindow = undefined;

  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    enableMessageMenuItems();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('open-file-sync', (event) => {
  event.returnValue = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openFile'],
    title: 'Select an image',
    filters: [
      { name: 'Portable Network Graphics', extensions: ['png', 'jpeg', 'jpg']}
    ]
  });  
});

ipcMain.on('save-file-sync', (event) => {
  event.returnValue = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: 'myImage',
    filters: [
      { name: 'Portable Network Graphics', extensions: ['png', 'jpeg', 'jpg'] }      
  ]
  });  
});

ipcMain.on('close-message-window-channel', () => {
  if (mainWindow) {    
    mainWindow.loadFile('src/index.html');
  }

  enableMessageMenuItems();
});

function createWindow () {
  const win = new BrowserWindow({
    width: 700,
    height: 750,
    webPreferences: {
      nodeIntegration: true
    }
  });

  //win.webContents.openDevTools();
  
  win.loadFile('src/index.html');

  mainWindow = win;
  setApplicationMenu();
}

function setApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
        label: 'Sneaky Weasel Info',
        submenu: [ 
          {
            id: aboutMenuItemID,
            label:'About',
            click() {
              showAboutWindow();
            }
          },            
          { type:'separator' }, 
          {
              label:'Exit Sneaky Weasel', 
              click() { 
                  app.quit();
              },
              accelerator: 'CmdOrCtrl+Q'
          }
        ]
    },
    {
      label: 'Sneaky messages',
      submenu: [
        { 
          id: hideMessageMenuItemID,
          label: 'Hide your text',
          click() {
            showHideMessageWindow();
          } 
        },
        { 
          id: readMessageMenuItemID,
          label: 'Discover messages',
          click() {
            showReadMessageWindow();
          } 
        }
      ]
    }
  ]);

  mainMenu = menu;
  Menu.setApplicationMenu(menu);
}

function showHideMessageWindow() {
  //mainWindow may not exist if the app is running on mac and the windows has been closed by the user
  if (!mainWindow) {
    createWindow();
  }

  mainWindow.loadFile('./src/hide-message/hide-message.html');            
  enableMessageMenuItems();
  setMenuItemStatus(hideMessageMenuItemID, false);
}

function showReadMessageWindow() {
  //mainWindow may not exist if the app is running on mac and the windows has been closed by the user
  if (!mainWindow) {
    createWindow();
  }

  mainWindow.loadFile('./src/read-message/read-message.html');
  enableMessageMenuItems();
  setMenuItemStatus(readMessageMenuItemID, false);
}

function showAboutWindow() {
  setMenuItemStatus(aboutMenuItemID, false);

  const isHideMessageMenuItemEnabled = isMenuItemEnabled(hideMessageMenuItemID);
  const isReadMessageMenuItemEnabled = isMenuItemEnabled(readMessageMenuItemID);

  setMenuItemStatus(hideMessageMenuItemID, false);
  setMenuItemStatus(readMessageMenuItemID, false);

  const aboutWnd = new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 200,
    frame: false,
    modal: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  aboutWnd.loadFile('src/about/about.html');
  aboutWindow = aboutWnd;
  ipcMain.on('close-about-window-sync', () => {
    if (aboutWindow) {
      aboutWindow.destroy();
    }    

    setMenuItemStatus(aboutMenuItemID, true);
    setMenuItemStatus(hideMessageMenuItemID, isHideMessageMenuItemEnabled);
    setMenuItemStatus(readMessageMenuItemID, isReadMessageMenuItemEnabled);
  });
}

function setMenuItemStatus(id, enabled) {
  if (!mainMenu) {
    return;
  }

  const menuItem = mainMenu.getMenuItemById(id);
  if (menuItem) {
    menuItem.enabled = enabled;
  }
}

function enableMessageMenuItems() {
  setMenuItemStatus(hideMessageMenuItemID, true);
  setMenuItemStatus(readMessageMenuItemID, true);
}

function isMenuItemEnabled(id) {
  const menuItem = mainMenu.getMenuItemById(id);
  return menuItem && menuItem.enabled;
}



//TO BE DELETED IF UNUSED
    function loadEvents() {
        var mailString;
        function updateMailString() {
            mailString = '?subject=' + encodeURIComponent($('#subject').val())
                + '&body=' + encodeURIComponent($('#message').val());
            $('#mail-link').attr('href',  'mailto:person@email.com' + mailString);
        }
        $( "#subject" ).focusout(function() { updateMailString(); });
        $( "#message" ).focusout(function() { updateMailString(); });
        updateMailString();
    }
