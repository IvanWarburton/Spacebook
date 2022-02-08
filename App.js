import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SignInScreen from './components/signIn';
import SignUpScreen from './components/signUp';
import ProfileScreen from './components/profile';
import FriendsScreen from './components/friends';
import FriendRequestScreen from './components/friendRequests';


const Drawer = createDrawerNavigator();

class App extends Component{
    render(){
        const isLoggedIn = false;

        if(isLoggedIn)
        {
            return (
                <NavigationContainer>
                    <Drawer.Navigator initialRouteName="Login">
                        <Drawer.Screen name="Profile" component={ProfileScreen} />
                        <Drawer.Screen name="Friends" component={FriendsScreen} />
                        <Drawer.Screen name="Friend Requests" component={FriendRequestScreen} />
                    </Drawer.Navigator>
                </NavigationContainer>
            );
        }
        else
        {
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
}

export default App;