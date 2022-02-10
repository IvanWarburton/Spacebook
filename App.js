import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SignInScreen from './components/SignIn';
import SignUpScreen from './components/SignUp';
import ProfileScreen from './components/Profile';
import FriendsScreen from './components/Friends';
import FriendRequestScreen from './components/FriendRequests';


const Drawer = createDrawerNavigator();

class App extends Component{

    constructor(props)
    {
        super(props);

        this.state = 
        {
            isLoggedIn: false
        }
    }

    componentDidMount() 
    {
        this.Login();
    }
    
    componentWillUnmount() {
        this.unsubscribe();
    }

    Login = async () =>
    {
        const LoggedInToken = await AsyncStorage.getItem('@session_token'); 
        
        console.log(LoggedInToken);

        if(LoggedInToken == null)
        {
            this.setState(
            {
                 isLoggedIn: false
            })
        }
        else
        {
            this.setState(
            {
                isLoggedIn: true
            })
        }
    }


    render(){

        
        if(this.state.isLoggedIn == true)
        {
            return (
                <NavigationContainer>
                    <Drawer.Navigator initialRouteName="Profile">
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
                    <Drawer.Navigator initialRouteName="Sign In">
                        <Drawer.Screen name="Sign In" component={SignInScreen} />
                        <Drawer.Screen name="Sign Up" component={SignUpScreen} />
                    </Drawer.Navigator>
                </NavigationContainer>
            );
        }
    }
}

export default App;