console.log('Testing button fixes...');

// Test if functions exist
const functions = [
    'loadProperties',
    'saveProperty',
    'editProperty',
    'deleteProperty',
    'togglePropertyStatus',
    'showNotification',
    'exportToCSV'
];

functions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        console.log(`✓ ${funcName}() is available`);
    } else {
        console.log(`✗ ${funcName}() is MISSING`);
    }
});

// Test HTML elements needed
const elements = [
    'propertyModal',
    'propertyForm',
    'addPropertyBtn',
    'propertiesContainer'
];

elements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`✓ #${elementId} found in DOM`);
    } else {
        console.log(`⚠ #${elementId} not found in DOM (may be optional)`);
    }
});

console.log('Test complete. Check browser console for results.');
