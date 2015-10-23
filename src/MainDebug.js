import React from 'react-native';

const {
  StyleSheet,
  Animated,
  LayoutAnimation,
  PanResponder,
  Text,
  View,
} = React;

const CARD_SIZE = 100;
const CARD_MARGIN = 10;
const CARD_WIDTH = CARD_SIZE; // 120;
const CARD_HEIGHT = CARD_SIZE; // 160;
const CARD_RADIUS = 3;
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

  _toggleIsActive() {
    console.log('_toggleIsActive for card');
    var config = {tension: 30, friction: 7};

    // If it's active, close it
    if (this.state.isActive) {
      Animated.spring(this.props.openVal, {toValue: 0, ...config}).start(() => {
        // When the animation is done, update the state and notify through the prop
        this.setState({isActive: false}, this.props.onDeactivate)
      });

    // Otherwise, activate it!
    } else {
      // Notify it's going active immediately
      this.props.onActivate();

      // Once the state is updated, start the animation
      this.setState({isActive: true}, () => {
        Animated.spring(this.props.openVal, {toValue: 1, ...config}).start();
      });
    }
  }

  render() {

    // Touch handlers
    const handlers = {
      // We're only interested in touches if the card isnt active
      onStartShouldSetResponder: () => !this.state.isActive,

      // On touch down
      onResponderGrant: () => {
        console.log('onResponderGrant');
        this._onLongPress()
      },

      // On touch up
      onResponderRelease: () => {
        console.log('onResponderRelease');
        // clearTimeout(this.longTimer);

        Animated.spring(this.state.pop, {
          toValue: 0,
          ...SPRING_CONFIG,
        }).start();

        this._toggleIsActive();
      }
    };

    // Make the styles to shrink the container based on the value of pop
    const scaleFactor = this.state.pop.interpolate({
      inputRange: [0, 1],
      outputRange: [1, .92]
    });
    var containerStyles = {
      transform: [{scale: scaleFactor}],
    };

    // Create the opening transition styles
    const openVal = this.props.openVal;
    let innerOpenStyle = undefined;
    const restLayout = this.props.restLayout || {x: 0, y: 0};
    const containerLayout = this.props.containerLayout || {width: 0, height: 0};

    console.groupCollapsed('Card render prop values:', restLayout.x, restLayout.y, containerLayout.width, containerLayout.height);
    console.log(restLayout);
    console.log(containerLayout);
    console.groupEnd();

    if (this.props.dummy) {
      // If this is a 'dummy' card (used just to maintain the layout), make it invisible
      console.log('Is a dummy card');
      containerStyles.opacity = 0;

    } else if (this.state.isActive) {
      // Create the correct styles for when the card is opening
      console.log('Is not a dummy card');
      innerOpenStyle = [
        styles.cardActive,
        // {
        //   left:         openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.x, 0]}),
        //   top:          openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.y, 0]}),
        //   width:        openVal.interpolate({inputRange: [0, 1], outputRange: [CARD_WIDTH, containerLayout.width]}),
        //   height:       openVal.interpolate({inputRange: [0, 1], outputRange: [CARD_HEIGHT, containerLayout.height]}),
        //   margin:       openVal.interpolate({inputRange: [0, 1], outputRange: [CARD_MARGIN, 0]}),
        //   borderRadius: openVal.interpolate({inputRange: [0, 1], outputRange: [CARD_RADIUS, 0]}),
        // },
        {
          left: 0,
          top: 0,
          width: containerLayout.width,
          height: containerLayout.height,
          margin: 0,
          borderRadius: 0,
        }
      ];

      console.log('innerOpenStyle:', innerOpenStyle[1]);

      // console.log('Open styles:', innerOpenStyle);
      // console.log('left from', restLayout.x, 'to', 0);
      // console.log('top from', restLayout.y, 'to', 0);
      // console.log('width from', CARD_WIDTH, 'to', containerLayout.width);
      // console.log('height from', CARD_HEIGHT, 'to', containerLayout.height);
      // console.log('margin from', CARD_MARGIN, 'to', 0);
      // console.log('borderRadius from', CARD_RADIUS, 'to', 0);
    }

    const containerStyleCollection = [containerStyles];

    return (
      <Animated.View
        {...handlers}
        onLayout={this.props.onLayout}
        style={[containerStyles, this.state.isActive && styles.cardActive]}>

        <Animated.View style={[styles.card, innerOpenStyle]}>
          <Text style={styles.cardText}>{this.props.value}</Text>
        </Animated.View>

      </Animated.View>
    );
  }
}

export default class Main extends React.Component {
  _onMove() {
    return void 0
  }

  constructor(props) {
    super(props);
    const cards = ['0']

    this.state = {
      cards,
      restLayouts: [],
      openVal: new Animated.Value(0),
    };

    this._onMove = this._onMove.bind(this);
    this._onLayout = this._onLayout.bind(this);
  }

  _onLayout(e) {
    console.log('running onLayout for container');
    this.setState({layout: e.nativeEvent.layout});
  }

  render() {
    // Create an array of <Card> items
    const items = this.state.cards.map((key, cardIndex) => {
      let onLayout;

      // If this card is active, we need to turn it into a dummy 'placeholder' Card
      if (key === this.state.activeKey) {
        const newKey = key + 'd'
        return <Card value={newKey} key={newKey} dummy={true} />
      }

      // When the Card is laid out, save its position. We'll use this later when
      // transitioning into the large view
      if (!this.state.restLayouts[cardIndex]) {
        console.log('Creating onlayout function for cardIndex', cardIndex);
        onLayout = (e) => {
          console.log('Triggering card onLayout');
          const layout = e.nativeEvent.layout;
          this.setState((state) => {
            state.restLayouts[cardIndex] = layout;
            return state;
          });
        }
      }

      return (
        <Card
          key={key}
          value={key}
          openVal={this.state.openVal}
          onLayout={onLayout}
          restLayout={this.state.restLayouts[cardIndex]}
          onActivate={this.setState.bind(this, {
            activeKey: key,
            activeInitialLayout: this.state.restLayouts[cardIndex],
          })}
        />
      );
    })

    // So, when there's an active card
    if (this.state.activeKey) {

      // Add in a backdrop
      items.push(
        <Animated.View key="dark" style={[styles.darkening, {opacity: 100}]} />
      );

      // And now create a card to animate out
      items.push(
        <Card
          openVal={this.state.openVal}
          key={this.state.activeKey}
          value={this.state.activeKey}
          restLayout={this.state.activeInitialLayout} // the layout of the original card, the starting point of the animation
          containerLayout={this.state.layout} // the layout of this whole component, the final layout we want to transition to
          onMove={this._onMove}
          onDeactivate={this.setState.bind(this, {
            activeKey: undefined,
          })}
        />
      );

    }

    return (
      <View style={styles.container}>
        <View style={styles.grid} onLayout={this._onLayout}>
          {items}
        </View>
      </View>
    );
  }
}


var originalStyles = StyleSheet.create({
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
    flex: 1,
    backgroundColor: '#9b59b6',
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: 20,
    margin: CARD_MARGIN,
    borderRadius: CARD_RADIUS,
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
  },

  darkening: {
    backgroundColor: 'rgba()',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64, // push content below nav bar
  },
  grid: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    borderWidth: 1,
    borderColor: 'black',
    margin: CARD_MARGIN,
    overflow: 'hidden',
    backgroundColor: '#2ecc71',
  },
  cardActive: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: undefined, // unset value from styles.card
    height: undefined, // unset value from styles.card
    borderRadius: 0, // unset value from styles.card
  },
  darkening: {
    backgroundColor: 'black',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

// rgba(0, 0, 0, 0.2) 0px 1px 2px 0px