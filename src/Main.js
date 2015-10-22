import React from 'react-native';

const {
  StyleSheet,
  Animated,
  LayoutAnimation,
  PanResponder,
  Text,
  View,
} = React;

const SPRING_CONFIG = {tension: 80, friction: 3};

class Card extends React.Component {
  constructor(props: Object): void {
    super();
    this._onLongPress = this._onLongPress.bind(this);
    this._toggleIsActive = this._toggleIsActive.bind(this);
    this.state = {
      isActive: false,
      pop: new Animated.Value(0),  // Initial value.               (step2a: uncomment)
    };
  }

  _onLongPress() {
    console.log('Long press is active');

    Animated.spring(this.state.pop, {
      toValue: 1,
      ...SPRING_CONFIG,
    }).start();
  }

  _toggleIsActive() {}

  render() {

    const handlers = {
      onStartShouldSetResponder: () => !this.state.isActive,
      onResponderGrant: () => {
        console.log('onResponderGrant');
        // this.state.pan.setValue({x: 0, y: 0});           // reset                (step1: uncomment)
        // this.state.pan.setOffset(this.props.restLayout); // offset from onLayout (step1: uncomment)
        this._onLongPress()
      },
      onResponderRelease: () => {
        console.log('onResponderRelease');
        // clearTimeout(this.longTimer);

        Animated.spring(this.state.pop, {
          toValue: 0,
          ...SPRING_CONFIG,
        }).start();
      }
    };

    var animatedStyle: Object = {
      transform: [
        {scale: this.state.pop.interpolate({
          inputRange: [0, 1],
          outputRange: [1, .92]         // scale up from 1 to 1.3               (step2d: uncomment)
        })},
      ],
    };

    return (
      <Animated.View style={[styles.card, animatedStyle, this.props.active && styles.cardActive]} {...handlers}>
        <Text style={styles.cardText}>{this.props.value}</Text>
      </Animated.View>
    );
  }
}

export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.grid}>

          <Card value='0' />
          <Card value='1' />
          <Card value='2' />
          <Card value='3' />
          <Card value='5' />
          <Card value='8' />

        </View>
      </View>
    );
  }
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    // paddingTop: 64, // push content below nav bar
  },

  grid: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: '#9b59b6',
  },

  card: {
    width: 120,
    height: 160,
    padding: 20,
    margin: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 3,
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },

  cardText: {
    textAlign: 'center',
  },

  cardActive: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: undefined,
    height: undefined,
  }
});

// rgba(0, 0, 0, 0.2) 0px 1px 2px 0px