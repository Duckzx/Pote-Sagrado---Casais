# Redesign Detailed Documentation

## Overview
This document outlines the comprehensive redesign for multiple components in the Duckzx/Pote-Sagrado---Casais repository. It provides step-by-step code examples for the following redesigns:
- HomeTab
- ExtratoTab
- ConfigTab

Additionally, new components are introduced:
- Drawer
- Stepper
- MotivationalCarousel

---

## HomeTab Redesign
### Step 1: Update HomeTab Layout
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

const HomeTab = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Home</Text>
            // Add other components as needed
        </View>
    );
};

export default HomeTab;
```

### Step 2: Styling HomeTab
```javascript
const styles = {
    container: { /* container styles */ },
    title: { /* title styles */ }
};
```

## ExtratoTab Redesign
### Step 1: Implement ExtratoTab
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

const ExtratoTab = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Extrato</Text>
            // Add list of transactions here
        </View>
    );
};

export default ExtratoTab;
```

### Step 2: Styling ExtratoTab
```javascript
const styles = {
    container: { /* container styles */ },
    title: { /* title styles */ }
};
```

## ConfigTab Redesign
### Step 1: Create ConfigTab
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

const ConfigTab = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Configuration</Text>
            // Add configuration options
        </View>
    );
};

export default ConfigTab;
```

### Step 2: Styling ConfigTab
```javascript
const styles = {
    container: { /* container styles */ },
    title: { /* title styles */ }
};
```

## New Components

### Drawer
```javascript
import React from 'react';
import { DrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={HomeTab} />
            <Drawer.Screen name="Extrato" component={ExtratoTab} />
            <Drawer.Screen name="Config" component={ConfigTab} />
        </Drawer.Navigator>
    );
};

export default MyDrawer;
```

### Stepper
```javascript
import React from 'react';
import { View, Text, Button } from 'react-native';

const Stepper = () => {
    const [step, setStep] = React.useState(0);

    return (
        <View>
            <Text>Current Step: {step}</Text>
            <Button title="Next" onPress={() => setStep(step + 1)} />
        </View>
    );
};

export default Stepper;
```

### MotivationalCarousel
```javascript
import React from 'react';
import { FlatList, Text, View } from 'react-native';

const MotivationalCarousel = ({ quotes }) => {
    return (
        <FlatList
            data={quotes}
            renderItem={({ item }) => <Text>{item}</Text>}
            keyExtractor={(item, index) => index.toString()}
        />
    );
};

export default MotivationalCarousel;
```

---

## Conclusion
This document serves as a guide for implementing the redesigned components in the Duckzx/Pote-Sagrado---Casais project, ensuring a modern and user-friendly interface.