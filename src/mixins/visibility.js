export default {
  data: () => {
    return {
      showAnimation: false
    };
  },
  methods: {
    isViewableNow(isVisible, entry) {
      this.showAnimation = isVisible;
    }
  }
};
