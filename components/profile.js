import React, { Component } from "react";
import { View, Text, StyleSheet, Image, Modal, TextInput, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "react-bootstrap/Button";

class Profile extends Component {

	constructor(props) {
		super(props);

		this.state = {
			listData: [],
			friendsFriendList: [],
			posts: [],
			viewingPost: [],
			isLoading: true,
			isLoadingPosts: true,
			isLoadingAPost: true,
			photo: null,
			loggedInUser: null,
			sessionToken: null,
			viewingUsersId: null,
			loggedInUserViewing: false,
			friendListModalVisible: false,
			postModalVisible: false,
			modalIsLoading: false,
			noPostsFound: true,
			isUsersPost: false,
			alertModalVisible: false,
			alertModalMesssage: "",
			post: { text: "" }
		};

	}

	async componentDidMount() {
		this.setState({
			sessionToken: await AsyncStorage.getItem("@session_token"),
			loggedInUser: await AsyncStorage.getItem("@user_id"),
			viewingUsersId: await AsyncStorage.getItem("@viewing_user_id")
		});
		await AsyncStorage.removeItem("@viewing_user_id");
		if (this.state.viewingUsersId == this.state.loggedInUser) {
			this.setState({ viewingUsersId: null });
		}
		this.getData();
	}


	getProfilePicture = async () => {
		let UserId = null;

		if (this.state.viewingUsersId != null) { UserId = this.state.viewingUsersId; }
		else { UserId = this.state.loggedInUser; }

		fetch("http://localhost:3333/api/1.0.0/user/" + UserId + "/photo",
			{ headers: { "X-Authorization": this.state.sessionToken } })
			.then((res) => { return res.blob(); })
			.then((resBlob) => {
				let data = URL.createObjectURL(resBlob);
				this.setState({
					photo: data
				});
				if (this.state.viewingUsersId != null) { this.getFriendsFriends(); }
				this.getPosts();
			})
			.catch((err) => {
				console.log("error", err);
			});
	};


	getData = async () => {
		let UserId = null;

		if (this.state.viewingUsersId != null) {
			UserId = this.state.viewingUsersId;
			this.setState({ loggedInUserViewing: false });
		}
		else {
			UserId = this.state.loggedInUser;
			this.setState({ loggedInUserViewing: true });
		}

		return fetch("http://localhost:3333/api/1.0.0/user/" + UserId, {
			"headers": { "X-Authorization": this.state.sessionToken }
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				this.getProfilePicture();
				this.setState({ listData: responseJson });
			})
			.catch((error) => {
				console.log(error);
			});
	};


	signOut = async () => {
		let token = await AsyncStorage.getItem("@session_token");
		await AsyncStorage.removeItem("@session_token");
		await AsyncStorage.removeItem("@user_id");
		await AsyncStorage.removeItem("@viewing_user_id");
		return fetch("http://localhost:3333/api/1.0.0/logout", {
			method: "post",
			headers: {
				"X-Authorization": token
			}
		})
			.then((response) => {
				if (response.status === 200) {
					console.log("Logged Out");
					window.location.reload(false);
				} else if (response.status === 401) {
					console.log("Logged Out");
					window.location.reload(false);
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	setFriendListModalVisible() {
		if (this.state.friendListModalVisible == false) { this.setState({ friendListModalVisible: true }); }
		else { this.setState({ friendListModalVisible: false }); }
	}

	async getFriendsFriends() {
		return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.viewingUsersId + "/friends", {
			"headers": {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({
					modalIsLoading: false,
					friendsFriendList: responseJson
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}

	getPosts = async () => {
		let user = null;

		if (this.state.viewingUsersId == null) { user = this.state.loggedInUser; }
		else { user = this.state.viewingUsersId; }

		return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post", {
			"headers": {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else if (response.status === 403) {
					console.log("Not friends with user");
				} else if (response.status === 404) {
					console.log("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				if (responseJson.length == 0) {
					this.setState({
						isLoading: false,
						isLoadingPosts: false,
						noPostsFound: true,
					});
				}
				else {
					this.setState({
						isLoading: false,
						isLoadingPosts: false,
						noPostsFound: false,
						posts: responseJson
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	postLists = () => {

		if (this.state.isLoadingPosts) {
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
		else if (this.state.noPostsFound) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
					}}>
					<Text>There are no posts at this time.</Text>
				</View>
			);
		}
		else {
			return (
				<FlatList
					data={this.state.posts}
					renderItem={({ item }) =>
						<View>
							<TouchableOpacity
								onPress={() => this.startPostModal(item.post_id)}
								style={styles.postContainer}>

								<Text style={styles.postText}>
									{item.author.first_name} {item.author.last_name}: {item.text}
								</Text>

								<Text style={styles.postText}>
									Likes: {item.numLikes} Date: {item.timestamp.slice(0, 10)} Time: {item.timestamp.slice(12, 16)} 
								</Text>

							</TouchableOpacity>
							{this.postModal(item.post_id)}

						</View>
					}
				/>

			);
		}

	};

	startPostModal(postID) {
		this.viewPost(postID);
		this.setState({ ["postModal" + postID + "Visible"]: true });
	}

	postModal(postID) {
		let modalName = "postModal" + postID + "Visible";

		if (typeof this.state[modalName] === "undefined") {
			this.setState({ [modalName]: false });
		}

		if (typeof this.state[modalName] != "undefined") {
			return (
				<View>
					<Modal visible={this.state[modalName]}
						animationType="fade"
						transparent={true}>

						{this.state.isLoadingAPost && (
							<View style={styles.modalView}>
								<Text>Loading... </Text>
								{console.log("code loading before suposed too here")}
								<Button onClick={() => this.setState({ [modalName]: false })}>Close</Button>
							</View>
						)}

						{!this.state.isLoadingAPost && (
							<View style={styles.modalView}>

								{!this.state.isUsersPost && (
									<View>
										<Text>
											{this.state.viewingPost.author.first_name} {this.state.viewingPost.author.last_name}: {this.state.viewingPost.text}
										</Text>

										<Text>
											Likes: {this.state.viewingPost.numLikes} Date: {this.state.viewingPost.timestamp.slice(0, 10)} Time: {this.state.viewingPost.timestamp.slice(12, 16)}
										</Text>
									</View>
								)}

								{this.state.isUsersPost && (
									<View>
										<Text>
											{this.state.viewingPost.author.first_name} {this.state.viewingPost.author.last_name}:
										</Text>
										<TextInput
											style={styles.input}
											placeholder={this.state.viewingPost.text}
											onChangeText={(post) => this.state.viewingPost.text = post}
										/>
									</View>
								)}

								{this.state.isUsersPost && (
									<View style={styles.container2}>
										<Button onClick={() => this.resetModal(postID)}>Close</Button>
										<Button onClick={() => this.updatePost(postID)}>Update Post</Button>
										<Button onClick={() => this.deletePost(postID)}>Delete</Button>
									</View>
								)}

								{!this.state.isUsersPost && (
									<View style={styles.container2}>
										<Button onClick={() => this.likePost(this.state.viewingPost.author.user_id, postID)}>Like</Button>
										<Button onClick={() => this.unLikePost(this.state.viewingPost.author.user_id, postID)}>UnLike</Button>
										<Button onClick={() => this.resetModal(postID)}>Close</Button>
									</View>
								)}

							</View>
						)}

					</Modal>
				</View>
			);
		}
	}

	resetModal(postID) {
		this.setState({ ["postModal" + postID + "Visible"]: false });
		this.setState({ isUsersPost: false });
	}

	async viewPost(postID) {
		this.setState({ isLoadingAPost: true });
		let user = null;
		if (this.state.viewingUsersId == null) { user = this.state.loggedInUser; }
		else { user = this.state.viewingUsersId; }

		return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post/" + postID, {
			"headers": {
				"X-Authorization": this.state.sessionToken
			}
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else if (response.status === 403) {
					console.log("Not friends with user");
				} else if (response.status === 404) {
					console.log("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.then((responseJson) => {
				this.setState({
					isLoadingAPost: false,
					viewingPost: responseJson
				});
				if (this.state.viewingPost.author.user_id == this.state.loggedInUser) { this.setState({ isUsersPost: true }); }
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async createPost() {
		let user = null;
		this.setState({ isLoadingPosts: true });

		if (this.state.viewingUsersId == null) { user = this.state.loggedInUser; }
		else { user = this.state.viewingUsersId; }

		return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post", {
			method: "post",
			headers: { "Content-Type": "application/json", "X-Authorization": this.state.sessionToken },
			body: JSON.stringify(this.state.post)
		})
			.then((response) => {
				if (response.status === 201) {
					console.log("Created");
					this.getPosts();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else if (response.status === 404) {
					console.log("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async updatePost(postID) {
		let user = null;

		if (this.state.viewingUsersId == null) { user = this.state.loggedInUser; }
		else { user = this.state.viewingUsersId; }

		this.setState({ isLoadingPosts: true });

		return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post/" + postID, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", "X-Authorization": this.state.sessionToken },
			body: JSON.stringify(this.state.viewingPost)
		})
			.then((response) => {
				if (response.status === 200) {
					console.log("Updated");
					this.setState({ ["postModal" + postID + "Visible"]: false });
					this.getPosts();
				} else if (response.status === 400) {
					console.log("Bad Request");
				} else if (response.status === 401) {
					console.log("Unauthorise");
				} else if (response.status === 403) {
					console.log("Forbidden - you can only update your own posts");
				} else if (response.status === 404) {
					console.log("Not Found");
				} else if (response.status === 500) {
					console.log("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async deletePost(postID) {
		let user = this.state.loggedInUser;
		this.setState({ isLoadingPosts: true });

		return fetch("http://localhost:3333/api/1.0.0/user/" + user + "/post/" + postID, {
			method: "DELETE",
			headers: { "X-Authorization": this.state.sessionToken }
		})
			.then((response) => {
				if (response.status === 200) {
					console.log("Post Delete");
					this.setState({ ["postModal" + postID + "Visible"]: false });
					this.getPosts();
				} else if (response.status === 401) {
					console.log("Unauthorised");
				} else if (response.status === 403) {
					console.log("You can only delete your own posts");
				} else if (response.status === 404) {
					console.log("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async likePost(postUser, postID) {
		this.setState({ isLoadingPosts: true });

		return fetch("http://localhost:3333/api/1.0.0/user/" + postUser + "/post/" + postID + "/like", {
			method: "POST",
			headers: { "X-Authorization": this.state.sessionToken }
		})
			.then((response) => {
				if (response.status === 200) {
					console.log("Post Liked");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.getPosts();
				} else if (response.status === 400) {
					console.log("Bad Request. You may have already liked this post.");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Bad Request. You may have already liked this post.");
				} else if (response.status === 401) {
					console.log("Unauthorised");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Unauthorised");
				} else if (response.status === 403) {
					console.log("You have already liked the post");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("You have already liked the post or you are not friends with this person.");
				} else if (response.status === 404) {
					console.log("Not found");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async unLikePost(postUser, postID) {
		this.setState({ isLoadingPosts: true });

		return fetch("http://localhost:3333/api/1.0.0/user/" + postUser + "/post/" + postID + "/like", {
			method: "DELETE",
			headers: { "X-Authorization": this.state.sessionToken }
		})
			.then((response) => {
				if (response.status === 200) {
					console.log("Post UnLiked");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.getPosts();
				} else if (response.status === 400) {
					console.log("Bad Request. You may have already Unliked this post.");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Bad Request. You may have already Unliked this post.");
				} else if (response.status === 401) {
					console.log("Unauthorised");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Unauthorised");
				} else if (response.status === 403) {
					console.log("You have not liked this post");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("You have not liked this post or you are not friends with this person.");
				} else if (response.status === 404) {
					console.log("Not found");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Not found");
				} else if (response.status === 500) {
					console.log("Server Error");
					this.setState({ ["postModal" + postID + "Visible"]: false, isLoadingPosts: false });
					this.alertMessage("Server Error");
				} else {
					throw "Something went wrong";
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	alertMessage(message) {
		this.setState({
			alertModalVisible: true,
			alertModalMesssage: message
		});
	}

	render() {
		if (this.state.isLoading) {
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
		else {
			return (
				<View style={styles.container}>

					{!this.state.loggedInUserViewing && (
						<Button onClick={() => window.location.reload(false)}>Back to Your Profile</Button>
					)}

					<Image
						style={styles.logo}
						source={{ uri: this.state.photo }}
					/>

					<Text style={styles.mainTitle}>
						{this.state.listData.first_name} {this.state.listData.last_name}
					</Text>


					<Text style={styles.mainText}>
						Email: {this.state.listData.email}
					</Text>

					{this.state.loggedInUserViewing && (
						<View style={styles.container2}>
							<Button onClick={() => this.props.navigation.navigate("Edit Profile")}>Edit Profile</Button>

							<Button onClick={() => this.props.navigation.navigate("Friends")}>{"Friends: " + this.state.listData.friend_count}</Button>

							<Button onClick={() => this.signOut()}>Sign Out</Button>
						</View>
					)}

					{!this.state.loggedInUserViewing && (
						<View>
							<Button onClick={() => this.setFriendListModalVisible()}>{"Friends: " + this.state.listData.friend_count}</Button>

							<Modal visible={this.state.friendListModalVisible}
								animationType="fade"
								transparent={true}>

								<View style={styles.modalView}>

									{this.state.modalIsLoading && (
										<View
											style={{
												flex: 1,
												flexDirection: "column",
												justifyContent: "center",
												alignItems: "center",
											}}>
											<Text style={styles.mainText}>Loading..</Text>
										</View>
									)}

									{!this.state.modalIsLoading && (
										<FlatList
											data={this.state.friendsFriendList}
											renderItem={({ item }) =>
												<View>
													<Text style={styles.mainText}>
														{item.user_givenname + " " + item.user_familyname}
													</Text>
													<Text style={styles.mainText}>
														{item.user_email}
													</Text>
												</View>
											}
										/>
									)}

									<Button onClick={() => this.setFriendListModalVisible()}>Close</Button>
								</View>

							</Modal>
						</View>
					)}

					<View style={styles.container2}>
						<TextInput
							style={styles.input}
							multiline={true}
							numberOfLines={3}
							placeholder="Add Post"
							onChangeText={(text) => this.state.post.text = text}
						/>

						<Button onClick={() => this.createPost()}>Add Post</Button>
					</View>

					<this.postLists />

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
	}
}

const styles = StyleSheet.create({
	container:
	{
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-evenly",
		alignItems: "center"
	},
	container2:
	{
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		width: "100%",
		margin: 10,
	},
	mainTitle:
	{
		flex: 1,
		fontSize: 40,
		fontWeight: "bold"
	},
	mainText:
	{
		flex: 1,
		fontSize: 15,
		fontWeight: "bold"
	},
	postContainer:
	{
		padding: 10,
	},
	postText:
	{
		fontSize: 15,
		fontWeight: "bold",
		width: "100%"
	},
	logo:
	{
		margin: 10, 
		width: 200,
		height: 200,
		borderRadius: 200 / 2
	},
	input:
	{
		padding: 10,
		fontSize: 15,
		fontWeight: "bold",
		width: "70%",
		borderRadius: 20,
	},
	modalView:
	{
		flex: 1,
		margin: 20,
		marginVertical: "80%",
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 1
	},
	alertModal:
	{
		flex: 1,
		margin: 20,
		marginVertical: "90%",
		backgroundColor: "#ffd4d8",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
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

export default Profile;