# Country Theme Selector

## Overview

The Country Theme Selector allows users to change the application's color scheme and background based on selected African countries. When Ghana is selected, a custom background image is displayed on all pages. For other countries, the UI uses gradient backgrounds based on their flag colors.

## What We Did

- **Implemented a theme system** using React Context API to manage country-based themes
- **Added 36 African countries** (22 West African + 14 East African countries)
- **Created dynamic color schemes** that change based on each country's flag colors
- **Special background handling** for Ghana - displays a custom background image on all pages
- **Gradient backgrounds** for all other countries based on their flag colors
- **Theme persistence** - selected theme is saved to localStorage

## How to Use

### For End Users

1. **Open the theme selector** - Click on the country flag/name in the header (top right)
2. **Select a country** - Choose from the dropdown list of 36 African countries
3. **Theme applies automatically** - The entire UI updates with the selected country's colors
4. **Ghana special feature** - When Ghana is selected, a background image appears on all pages
5. **Theme persists** - Your selection is saved and will be remembered on your next visit

### Available Countries

**West Africa (22 countries):**
Ghana, Nigeria, Senegal, Côte d'Ivoire, Mali, Burkina Faso, Niger, Guinea, Sierra Leone, Liberia, Togo, Benin, Gambia, Guinea-Bissau, Cape Verde, Cameroon, Equatorial Guinea, Gabon, Congo, Central African Republic, Chad, São Tomé and Príncipe

**East Africa (14 countries):**
Kenya, Tanzania, Uganda, Rwanda, Burundi, Ethiopia, Eritrea, Djibouti, Somalia, South Sudan, Madagascar, Seychelles, Comoros, Mauritius

## Technical Details

- **Theme Context**: `client/src/contexts/ThemeContext.tsx`
- **Theme Switcher Component**: `client/src/components/ThemeSwitcher.tsx`
- **CSS Variables**: Dynamic colors are applied via CSS custom properties
- **Background Image**: Ghana uses `hammer-gave234649.jpg` from `client/src/Assets/`

## Features

✅ 36 African countries with unique color schemes  
✅ Ghana background image on all pages  
✅ Gradient backgrounds for other countries  
✅ Theme persistence across sessions  
✅ Scrollable dropdown for easy country selection  
✅ Responsive design

