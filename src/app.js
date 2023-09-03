import { setupCatalog } from './views/catalog.js';
import { setupCreate } from './views/create.js';
import { setupLogin } from './views/login.js';
import { setupRegister } from './views/register.js';
import { setupDetails } from './views/details.js';
import { setupEdit } from './views/edit.js';
import { logout as apiLogout } from './api/data.js';
import {createNavigation } from './navigation.js';


window.addEventListener('load', async () => {
    const main = document.querySelector('main');
    const nav = document.querySelector('nav');
    
    const navigation = createNavigation(main, nav);

    navigation.addView('catalog', document.getElementById('catalog'), setupCatalog, 'catalogLink');
    navigation.addView('details', document.getElementById('details'), setupDetails);
    navigation.addView('login', document.getElementById('login'), setupLogin, 'loginLink');
    navigation.addView('register', document.getElementById('register'), setupRegister, 'registerLink');
    navigation.addView('create', document.getElementById('create'), setupCreate, 'createLink');
    navigation.addView('edit', document.getElementById('edit'), setupEdit);
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('views').remove();

    // Start application in catalog view
    navigation.goTo('catalog');

    async function logout() {
        await apiLogout();
        navigation.setUserNav();
        navigation.goTo('catalog');
    }
});