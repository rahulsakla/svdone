const optionsExtraData = {
  my_listings: {
    routeName: "My Listings",
    icon: "hdd-o",
    assetUri: require("../../../assets/my_listings.png"),
    id: "my_listings",
  },
  favourite: {
    routeName: "Favourite",
    icon: "star",
    assetUri: require("../../../assets/favorites.png"),
    id: "favourite",
  },
  my_membership: {
    routeName: "My Membership",
    icon: "diamond",
    assetUri: require("../../../assets/my_membership.png"),
    id: "my_membership",
  },
  my_store: {
    routeName: "My Store Settings",
    icon: "store_icon",
    assetUri: require("../../../assets/store_icon.png"),
    id: "my_store",
  },
  all_stores: {
    routeName: "Stores",
    icon: "store_icon",
    assetUri: require("../../../assets/all_store_icon.png"),
    id: "all_stores",
  },

  my_profile: {
    routeName: "My Profile",
    icon: "user",
    assetUri: require("../../../assets/my_profile.png"),
    id: "my_profile",
  },

  payments: {
    routeName: "Payments",
    icon: "money",
    assetUri: require("../../../assets/payments.png"),
    id: "payments",
  },

  faq: {
    routeName: "FAQ",
    icon: "question-circle",
    assetUri: require("../../../assets/faq.png"),
    id: "faq",
  },
  how_to_sell_fast: {
    routeName: "How To Sell Fast",
    icon: "key",
    assetUri: require("../../../assets/how_to_sell_fast.png"),
    id: "how_to_sell_fast",
  },
  more: {
    routeName: "More",
    icon: "ellipsis-h",
    assetUri: require("../../../assets/more.png"),
    id: "more",
  },
};

export function getOptionsExtraData() {
  return optionsExtraData;
}
