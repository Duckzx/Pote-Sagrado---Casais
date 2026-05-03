# Pote Sagrado App UI/UX Redesign Guide

This document outlines a comprehensive redesign guide for the Pote Sagrado app, focusing on UI/UX improvements. The guide includes detailed code examples for the `HomeTab`, `ExtratoTab`, `ConfigTab`, and new reusable components such as `Drawer`, `Stepper`, and `MotivationalCarousel` using Tailwind CSS and React patterns.

## Table of Contents
1. [HomeTab](#hometab)
2. [ExtratoTab](#extratotab)
3. [ConfigTab](#configtab)
4. [Reusable Components](#reusable-components)
   - [Drawer](#drawer)
   - [Stepper](#stepper)
   - [MotivationalCarousel](#motivationalcarousel)

## HomeTab

### Description
The `HomeTab` serves as the main dashboard of the app where users can quickly access essential features and information. 

### Code Example
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import 'tailwindcss/tailwind.css';

const HomeTab = () => {
    return (
        <View className="flex-1 bg-white p-5">
            <Text className="text-2xl font-bold mb-4">Welcome to Pote Sagrado</Text>
            <Text className="text-lg">Your savings at a glance</Text>
            {/* Additional components go here */}
        </View>
    );
};

export default HomeTab;
```

## ExtratoTab

### Description
The `ExtratoTab` displays the transaction history, providing users with insights into their saving patterns.

### Code Example
```javascript
import React from 'react';
import { FlatList, View, Text } from 'react-native';
import 'tailwindcss/tailwind.css';

const ExtratoTab = ({ transactions }) => {
    return (
        <View className="flex-1 bg-gray-100 p-5">
            <Text className="text-xl font-bold mb-4">Transaction History</Text>
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="p-3 bg-white mb-2 rounded shadow">
                        <Text className="text-lg font-semibold">{item.title}</Text>
                        <Text>{item.date}</Text>
                        <Text className="text-green-600 font-bold">${item.amount}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default ExtratoTab;
```

## ConfigTab

### Description
The `ConfigTab` allows users to configure their app settings, account details, and preferences.

### Code Example
```javascript
import React from 'react';
import { View, Text, Switch } from 'react-native';
import 'tailwindcss/tailwind.css';

const ConfigTab = ({ settings, onSettingsChange }) => {
    return (
        <View className="flex-1 bg-white p-5">
            <Text className="text-xl font-bold mb-4">Settings</Text>
            {Object.keys(settings).map((key) => (
                <View key={key} className="flex-row items-center mb-4">
                    <Text className="flex-1 text-lg">{key}</Text>
                    <Switch
                        value={settings[key]}
                        onValueChange={(value) => onSettingsChange(key, value)}
                    />
                </View>
            ))}
        </View>
    );
};

export default ConfigTab;
```

## Reusable Components

### Drawer
#### Code Example
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import 'tailwindcss/tailwind.css';

const Drawer = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
        <View className="absolute top-0 left-0 w-3/4 h-full bg-white shadow-lg">
            <Text className="p-5 text-xl font-bold">Menu</Text>
            {/* Drawer items go here */}
            <Text onPress={onClose} className="p-5 text-red-600">Close</Text>
        </View>
    );
};

export default Drawer;
```

### Stepper
#### Code Example
```javascript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import 'tailwindcss/tailwind.css';

const Stepper = ({ steps, currentStep }) => {
    return (
        <View className="flex-row justify-between mb-4">
            {steps.map((step, index) => (
                <TouchableOpacity key={index} className={`p-2 ${currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> 
                    <Text>{step}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default Stepper;
```

### MotivationalCarousel
#### Code Example
```javascript
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import 'tailwindcss/tailwind.css';

const MotivationalCarousel = ({ quotes }) => {
    return (
        <View className="mb-5">
            <FlatList
                data={quotes}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="w-72 p-5 bg-yellow-100 rounded-lg m-2">
                        <Text className="text-lg font-bold">{item.quote}</Text>
                        <Text className="text-sm text-gray-600">- {item.author}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default MotivationalCarousel;
```

## Conclusion
This guide provides a foundation for enhancing the Pote Sagrado app's UI/UX, ensuring a better and more engaging user experience. Each component can be expanded further based on user feedback and testing.