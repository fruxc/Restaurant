import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  Button,
  PanResponder,
  Alert,
  Share,
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postComment, postFavorite } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites,
  };
};

const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment)),
});

function RenderDish({ dish, favorite, markFavorite, commentForm }) {
  const shareDish = (title, message, url) => {
    Share.share(
      {
        title: title,
        message: title + ": " + message + " " + url,
        url: url,
      },
      {
        dialogTitle: "Share " + title,
      }
    );
  };
  handleViewRef = (ref) => (this.view = ref);

  const recognizeComment = ({ moveX, moveY, dx, dy }) => {
    if (dx > 200) {
      return true;
    } else {
      return false;
    }
  };
  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) {
      return true;
    } else {
      return false;
    }
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderGrant: () => {
      this.view
        .rubberBand(1000)
        .then((endState) =>
          console.log(endState.finished ? "finished" : "cancelled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState)) {
        Alert.alert(
          "Add Favorite",
          "Are you sure you wish to add " + dish.name + " to favorite?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => {
                favorite ? console.log("Already favorite") : markFavorite();
              },
            },
          ],
          { cancelable: false }
        );
      } else if (recognizeComment(gestureState)) {
        commentForm();
      }
      return true;
    },
  });

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        ref={this.handleViewRef}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Icon
              raised
              reverse
              name={favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                favorite ? console.log("Already favorite") : markFavorite()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => commentForm()}
            />
            <Icon
              raised
              reverse
              name="share"
              type="font-awesome"
              color="#51D2A8"
              style={styles.cardItem}
              onPress={() =>
                shareDish(dish.name, dish.description, baseUrl + dish.image)
              }
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments({ comments }) {
  const renderCommentItem = ({ item, index }) => {
    return (
      <View
        key={index}
        style={{
          margin: 10,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          type="star"
          fractions={0}
          startingValue={item.rating}
          imageSize={15}
        />
        <Text style={{ fontSize: 12 }}>
          {"--" + item.author + ", " + item.date}
        </Text>
      </View>
    );
  };

  if (comments != null) {
    return (
      <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title="Comments">
          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

class DishDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 1,
      author: "",
      comment: "",
      showForm: false,
    };
  }

  static navigationOptions = {
    title: "Dish Details",
  };

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  resetForm() {
    this.setState({
      rating: 1,
      author: "",
      comment: "",
      showForm: false,
    });
  }

  handleComment(dishId) {
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment
    );
    this.resetForm();
  }

  commentForm() {
    this.setState({ showForm: true });
  }

  setRating(rating) {
    this.setState({ rating });
  }

  setAuthor(author) {
    this.setState({ author });
  }

  setComment(comment) {
    this.setState({ comment });
  }

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");

    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some((el) => el === dishId)}
          markFavorite={() => this.markFavorite(dishId)}
          commentForm={() => this.commentForm()}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showForm}
          onDismiss={() => {
            this.resetForm();
          }}
          onRequestClose={() => {
            this.resetForm();
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Your Comment</Text>
            <Rating
              minValue={1}
              startingValue={3.3}
              fractions={0}
              showRating={true}
              onFinishRating={(rating) => this.setRating(rating)}
            />
            <Input
              placeholder="Author"
              leftIcon={<Icon name="user" type="font-awesome" />}
              onChangeText={(author) => this.setAuthor(author)}
            />
            <Input
              placeholder="Comment"
              leftIcon={<Icon name="comment" type="font-awesome" />}
              onChangeText={(comment) => this.setComment(comment)}
            />
            <Button
              onPress={() => {
                this.handleComment(dishId);
              }}
              color="#512DA8"
              title="SUBMIT"
            />
            <Button
              onPress={() => {
                this.resetForm();
              }}
              color="#6c757d"
              title="CANCEL"
            />
          </View>
        </Modal>
        <RenderComments
          comments={this.props.comments.comments.filter(
            (comment) => comment.dishId === dishId
          )}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
  modal: {
    justifyContent: "center",
    margin: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
