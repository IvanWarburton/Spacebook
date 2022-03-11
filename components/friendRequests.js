import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Button from "react-bootstrap/Button";

class FriendRequests extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoadingData: true,
			requestList: [],
			alertModalVisible: false,
			alertModalMesssage: "",
		};
	}

	async componentDidMount() {
		this.searchForRequests();
	}

	searchForRequests = async () => {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests", {
			"headers": {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					throw "Error 401: Unauthorised";
				} else if (response.status === 500) {
					throw "Error 500: Server Error";
				} else {
					throw "Error: Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({
					isLoadingData: false,
					requestList: responseJson
				});
			})
			.catch((error) => {
				this.alertMessage(error);
			});
	};

	async acceptFriend(firendID) {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
			method: "post",
			headers: {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return "Request Accepted";
				} else if (response.status === 201) {
					return "Request Accepted";
				} else if (response.status === 401) {
					throw "Error 401: Unauthorised";
				} else if (response.status === 403) {
					throw "Error 403: User is already added as a friend";
				} else if (response.status === 404) {
					throw "Error 404: Not Found";
				} else {
					throw "Error: Something went wrong";
				}
			})
			.catch((error) => {
				this.alertMessage(error);
			});
	}

	async rejectFriend(firendID) {
		const SessionToken = await AsyncStorage.getItem("@session_token");

		return fetch("http://localhost:3333/api/1.0.0/friendrequests/" + firendID, {
			method: "DELETE",
			headers: {
				"X-Authorization": SessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return "Request Accepted";
				} else if (response.status === 201) {
					return "Request Accepted";
				} else if (response.status === 401) {
					throw "Error 401: Unauthorised";
				} else if (response.status === 403) {
					throw "Error 403: User is already added as a friend";
				} else if (response.status === 404) {
					throw "Error 404: Not Found";
				} else {
					throw "Error: Something went wrong";
				}
			})
			.catch((error) => {
				this.alertMessage(error);
			});
	}

	alertMessage(message) {
		this.setState({
			alertModalVisible: true,
			alertModalMesssage: message
		});
	}

	render() {
		if (this.state.isLoadingData) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}>
					<Text>Loading..</Text>
				</View>
			);
		}
		else if (this.state.requestList.length > 0) {
			return (
				<View style={styles.container}>

					<Text style={styles.mainTitle}>
						Friend Requests
					</Text>


					<FlatList
						data={this.state.requestList}
						renderItem={({ item }) =>
							<View style={styles.container2}>

								<Text style={styles.mainText}>
									{item.first_name + " " + item.last_name}
								</Text>

								<Ionicons name="person-add" style={styles.icon} onPress={() => this.acceptFriend(item.user_id)}></Ionicons>

								<Ionicons name="person-remove" style={styles.icon} onPress={() => this.rejectFriend(item.user_id)}></Ionicons>
							</View>
						}
					/>

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text>ALERT</Text>
								<Text>{this.state.alertModalMesssage}</Text>
								<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
							</View>

						</Modal>
					</View>

				</View>
			);
		}
		else {
			return (
				<View style={styles.container}>

					<Text style={styles.mainTitle}>
						Friends Requests
					</Text>


					<Text style={styles.mainText}>
						It doesnt look like you have any friends requests at this time.
					</Text>

					<View>
						<Modal visible={this.state.alertModalVisible}
							animationType="fade"
							transparent={true}>

							<View style={styles.alertModal}>
								<Text style={styles.mainText}>ALERT</Text>
								<Text style={styles.mainText}>{this.state.alertModalMesssage}</Text>
								<Button onClick={() => this.setState({ alertModalVisible: false })}>Close</Button>
							</View>

						</Modal>
					</View>

				</View>
			);
		}
	}
}

const styles = StyleSheet.create({
	container:
	{
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "100%",
		padding: 10
	},
	container2:
	{
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: 250,
		margin: 10,
	},
	mainTitle:
	{
		fontSize: 40,
		fontWeight: "bold",
		textAlign: "center",
		margin: 40
	},
	mainText:
	{
		flex: 1,
		fontSize: 15,
		fontWeight: "bold",
		margin: 40
	},
	button:
	{
		padding: 10
	},
	input:
	{
		margin: 40,
		padding: 10,
		width: "70%"
	},
	icon:
	{
		fontSize: "200%",
		margin: 10
	},
	alertModal:
	{
		flex: 1,
		justifyContent: "space-evenly",
		margin: 20,
		marginVertical: "90%",
		backgroundColor: "#ffd4d8",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		textAlign: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	}
});

export default FriendRequests;