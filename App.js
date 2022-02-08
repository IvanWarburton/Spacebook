import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SignInScreen from './components/signIn';
import SignUpScreen from './components/signUp';


const Drawer = createDrawerNavigator();

class App extends Component{
    render(){
        return (
            <NavigationContainer>
                <Drawer.Navigator initialRouteName="Login">
                    <Drawer.Screen name="Login" component={SignInScreen} />
                    <Drawer.Screen name="Signup" component={SignUpScreen} />
                </Drawer.Navigator>
                
            </NavigationContainer>
        );
    }
}

export default App;