import "react-native-gesture-handler";
import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "bootstrap/dist/css/bootstrap.min.css";

import SignInScreen from "./components/SignIn";
import SignUpScreen from "./components/SignUp";
import ProfileScreen from "./components/Profile";
import EditProfile from "./components/EditProfile";
import FriendsScreen from "./components/Friends";
import FriendRequestScreen from "./components/FriendRequests";


const Tab = createBottomTabNavigator();

class App extends Component {

	constructor(props) {

		super(props);

		this.state = { 
			isLoggedIn: false,
			viewingUsersId: null,
			profileIcon: "person-circle"
		};
	}

	async componentDidMount() {
		this.setState({viewingUsersId: await AsyncStorage.getItem("@viewing_user_id")});
		if (this.state.viewingUsersId != null) {
			this.setState({ profileIcon: "people-circle" });
		}
		this.Login();
	}


	Login = async () => {
		const LoggedInToken = await AsyncStorage.getItem("@session_token");

		if (LoggedInToken == null) {
			this.setState(
				{
					isLoggedIn: false
				});
		}
		else {
			this.setState(
				{
					isLoggedIn: true
				});
		}
	};


	render() {

		if (this.state.isLoggedIn == true) {
			return (
				<NavigationContainer>
					<Tab.Navigator initialRouteName="Profile"
						screenOptions={({ route }) => ({
							headerShown: false,
							tabBarOptions: { style: { backgroundColor: "#ff11ff" } },
							tabBarIcon: ({ focused, color, size }) => {
								if (route.name === "Profile") {
									return (
										<Ionicons
											name={focused
												? (this.state.profileIcon)
												: ((this.state.profileIcon)+"-outline")
											}
											size={size}
											color={color} />
									);
								} else if (route.name === "Edit Profile") {
									return (
										<Ionicons
											name={focused
												? "create"
												: "create-outline"
											}
											size={size}
											color={color}
										/>
									);
								} else if (route.name === "Friends") {
									return (
										<Ionicons
											name={focused
												? "people"
												: "people-outline"
											}
											size={size}
											color={color}
										/>
									);
								} else if (route.name === "Friend Requests") {
									return (
										<Ionicons
											name={focused
												? "person-add"
												: "person-add-outline"
											}
											size={size}
											color={color}
										/>
									);
								}
							},
							tabBarInactiveTintColor: "gray",
							tabBarActiveTintColor: "black",
						})}>
						<Tab.Screen name="Profile" component={ProfileScreen} />
						<Tab.Screen name="Edit Profile" component={EditProfile} />
						<Tab.Screen name="Friends" component={FriendsScreen} />
						<Tab.Screen name="Friend Requests" component={FriendRequestScreen} />
					</Tab.Navigator>
				</NavigationContainer>
			);
		}
		else {
			return (
				<NavigationContainer>
					<Tab.Navigator initialRouteName="Sign In"
						screenOptions={({ route }) => ({
							headerShown: false,
							tabBarOptions: { style: { backgroundColor: "#ff11ff" } },
							tabBarIcon: ({ focused, color, size }) => {
								if (route.name === "Sign In") {
									return (
										<Ionicons
											name={focused
												? "log-in"
												: "log-in-outline"
											}
											size={size}
											color={color} />
									);
								} else if (route.name === "Sign Up") {
									return (
										<Ionicons
											name={focused
												? "create"
												: "create-outline"
											}
											size={size}
											color={color}
										/>
									);
								}
							},
							tabBarInactiveTintColor: "gray",
							tabBarActiveTintColor: "black",
						})}>
						<Tab.Screen name="Sign In" component={SignInScreen} />
						<Tab.Screen name="Sign Up" component={SignUpScreen} />
					</Tab.Navigator>
				</NavigationContainer>
			);
		}
	}
}

export default App;