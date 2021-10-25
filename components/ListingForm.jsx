import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
} from "react-native";

// Expo Libraries
import * as Location from "expo-location";

// Vector Icons
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

// External Libraries
import { debounce } from "lodash";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import * as Progress from "react-native-progress";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { GooglePlacesAutocomplete } from "./map/GooglePlacesAutocomplete";

// Custom Components & Variables
import { COLORS } from "../variables/color";
import AppSeparator from "./AppSeparator";
import AppButton from "./AppButton";
import DynamicListPicker from "./DynamicListPicker";
import ImageInputList from "./ImageInputList";
import api, {
  setAuthToken,
  setMultipartHeader,
  removeMultipartHeader,
  removeAuthToken,
} from "../api/client";
import DynamicRadioButton from "./DynamicRadioButton";
import DynamicCheckbox from "./DynamicCheckbox";
import { useStateValue } from "../StateProvider";
import { getCurrencySymbol, decodeString } from "../helper/helper";
import DatePicker from "./DatePicker";
import DateRangePicker from "./DateRangePicker";
import DoneIndicator from "./DoneIndicator";
import UploadingIndicator from "./UploadingIndicator";
import ErrorIndicator from "./ErrorIndicator";
import { getTnC } from "../language/stringPicker";
import AppRadioButton from "./AppRadioButton";
import { __ } from "../language/stringPicker";
import BHTimePicker from "./BHTimePicker";
import SBHDatePicker from "./SBHDatePicker";
import mime from "mime";

const autocompleteLanguage = "en";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const ListingForm = ({ catId, type, goBack }) => {
  const [{ auth_token, user, listing_locations, config, ios, appSettings }] =
    useStateValue();
  const [validationSchema_contact, setValidationSchema_contact] = useState(
    Yup.object().shape({
      name: Yup.string().required(
        __("listingFormTexts.nameLabel", appSettings.lng) +
          " " +
          __("listingFormTexts.formValidation.requiredField", appSettings.lng)
      ),
      zipcode: Yup.string().min(
        3,
        __("listingFormTexts.zipCodeLabel", appSettings.lng) +
          " " +
          __("listingFormTexts.formValidation.minimumLength3", appSettings.lng)
      ),
      website: Yup.string().matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        __("listingFormTexts.websiteErrorLabel", appSettings.lng)
      ),
      address: Yup.string().label(
        __("listingFormTexts.addressLabel", appSettings.lng)
      ),
      email: Yup.string()
        .required(
          __("listingFormTexts.emailLabel", appSettings.lng) +
            " " +
            __("listingFormTexts.formValidation.requiredField", appSettings.lng)
        )
        .email(
          __("listingFormTexts.formValidation.validEmail", appSettings.lng)
        ),
      phone: Yup.string()
        .required(
          __("listingFormTexts.phoneLabel", appSettings.lng) +
            " " +
            __("listingFormTexts.formValidation.requiredField", appSettings.lng)
        )
        .min(
          5,
          __("listingFormTexts.phoneLabel", appSettings.lng) +
            " " +
            __(
              "listingFormTexts.formValidation.minimumLength5",
              appSettings.lng
            )
        ),
      whatsapp_number: Yup.string().min(
        5,
        __("listingFormTexts.whatsappLabel", appSettings.lng) +
          " " +
          __("listingFormTexts.formValidation.minimumLength5", appSettings.lng)
      ),
    })
  );
  const [imageUris, setImageUris] = useState([]);
  const [imageObjects, setImageObjects] = useState([]);
  const [listingData, setListingData] = useState({});
  const [tnCData, setTnCData] = useState(getTnC(appSettings.lng));
  const [listingCommonData, setListingCommonData] = useState({});
  const [loading, setLoading] = useState(true);

  const [priceUnitPickerVisivle, setPriceUnitPickerVisivle] = useState(false);
  const [formData, setFormData] = useState();
  const [customFieldsErrors, setCustomFieldsError] = useState({});
  const [commonFieldsErrors, setCommonFieldsError] = useState(false);
  const [commonRequiredFields, setCommonRequiredFields] = useState([
    "title",
    "price_type",
    "pricing_type",
  ]);
  const [touchedFields, setTouchedFields] = useState([]);
  const [socialErrors, setSocialErrors] = useState([]);
  const [validateCfDependency, setValidateCfDependency] = useState([]);

  const [tnCToggle, setTnCToggle] = useState(false);
  const [tnCVisible, setTnCVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasImage, setHasImage] = useState();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [mapType, setMapType] = useState("standard");
  const [markerPosition, setMarkerPosition] = useState();
  const [region, setRegion] = useState();
  const [hideMap, setHideMap] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [listingGeoAddress, setListingGeoAddress] = useState("");
  const [geoCoderFail, setGeoCoderFail] = useState(false);
  const [geoCoderFailedMessage, setGeoCoderFailedMessage] = useState("");
  const [videoUrlValid, setVideoUrlValid] = useState(true);
  const [locationRequired, setLocationRequired] = useState(
    config.location_type === "local" ? false : true
  );
  const [socialProfiles, setSocialProfiles] = useState({});
  const [bHActive, setBHActive] = useState(false);
  const [defaultBH, setDefaultBH] = useState({
    0: { open: false },
    1: { open: false },
    2: { open: false },
    3: { open: false },
    4: { open: false },
    5: { open: false },
    6: { open: false },
  });
  const [defaultSBH, setDefaultSBH] = useState([]);

  const mapViewRef = useRef();

  const isNumeric = (n) => {
    return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
  };

  const isEqualToNumber = (v1, v2) => {
    return parseFloat(v1) === parseFloat(v2);
  };

  const isEqualTo = (v1, v2) => {
    return parseString(v1).toLowerCase() === parseString(v2).toLowerCase();
  };

  const containsString = (haystack, needle) => {
    return parseString(haystack).indexOf(parseString(needle)) > -1;
  };
  const matchesPattern = (v1, pattern) => {
    const regexp = new RegExp(parseString(pattern), "gi");
    return parseString(v1).match(regexp);
  };

  const parseString = (str) => {
    return str ? "" + str : "";
  };

  const cfValidated = (rule, cfs) => {
    let isValid = 0;
    const field_id = rule.field;

    const operator = rule.operator;
    const dependFieldArray = cfs ? cfs.filter((_) => _.id == field_id) : [];
    let dependField = dependFieldArray.length ? dependFieldArray[0] : "";
    if (dependField) {
      const dependentFieldValue = listingData["_field_" + field_id] || "";
      //TODO: Check if filed is exist at custom field object
      if (operator === "==empty") {
        // hasNoValue
        isValid = Array.isArray(dependentFieldValue)
          ? !dependentFieldValue.length
          : !dependentFieldValue;
      } else if (operator === "!=empty") {
        // hasValue  -- ANY value
        isValid = Array.isArray(dependentFieldValue)
          ? !!dependentFieldValue.length
          : !!dependentFieldValue;
      } else if (operator === "==") {
        // equalTo
        if (isNumeric(rule.value)) {
          return isEqualToNumber(rule.value, dependentFieldValue);
        } else {
          return isEqualTo(rule.value, dependentFieldValue);
        }
      } else if (operator === "!=") {
        // notEqualTo
        if (isNumeric(rule.value)) {
          return !isEqualToNumber(rule.value, dependentFieldValue);
        } else {
          return !isEqualTo(rule.value, dependentFieldValue);
        }
      } else if (operator === "==pattern") {
        // patternMatch
        return matchesPattern(dependentFieldValue, rule.value);
      } else if (operator === "==contains") {
        // contains
        return containsString(dependentFieldValue, rule.value);
      }
    }
    isValid = isValid === 0 || isValid === 1 ? !!isValid : isValid;
    return isValid;
  };

  const cfDependencyValidateor = (field, cfs) => {
    if (!field.dependency) {
      return true;
    }
    const con = [];
    field.dependency.map((rules) => {
      const conInner = [];
      rules.map((rule) => {
        conInner.push(cfValidated(rule, cfs));
      });
      con.push(conInner);
    });
    if (con.map((item) => !item.includes(false)).includes(true)) {
      return true;
    }
    return false;
  };

  const initialCFDependencyCheck = (cfs) => {
    const tempCfFieldIds = [];
    if (cfs.length) {
      cfs.map((_cf) => {
        if (cfDependencyValidateor(_cf, cfs)) {
          tempCfFieldIds.push(_cf.id);
        }
      });
    }

    setValidateCfDependency(tempCfFieldIds);
  };

  useEffect(() => {
    if (!formData) return;
    initialCFDependencyCheck(formData.custom_fields);
  }, [listingData]);

  // Load listing form
  useEffect(() => {
    if (formData) return;
    setAuthToken(auth_token);
    api.get("listing/form", { category_id: catId }).then((res) => {
      if (res.ok) {
        setFormData(res.data);
        initialCFDependencyCheck(res.data.custom_fields);
        let tempListingCommonData = {};
        tempListingCommonData["pricing_type"] = "price";

        if (res?.data?.config?.hidden_fields?.includes("price_type")) {
          const tmpCmnReqFlds = commonRequiredFields.filter(
            (_fld) => _fld !== "price_type"
          );
        }
        tempListingCommonData["price_type"] = "fixed";

        setListingCommonData(tempListingCommonData);

        if (res.data.config.hidden_fields) {
          setCommonRequiredFields((prevCommonRequiredFields) =>
            prevCommonRequiredFields.filter(
              (common) => !res.data.config.hidden_fields.includes(common)
            )
          );
        }
        if (config?.map?.api_key) {
          Geocoder.init(config.map.api_key);
        }
        let geoAddress = [];
        if (user.address) {
          geoAddress.push(user.address);
        }
        if (user.zipcode) {
          geoAddress.push(user.zipcode);
        }
        if (config.location_type === "local" && listing_locations.length) {
          listing_locations.map((_location) => geoAddress.push(_location.name));
        }
        if (geoAddress.length && config?.map) {
          Geocoder.from(decodeString(geoAddress.join(", ")))
            .then((json) => {
              var location = json.results[0].geometry.location;
              const initialMarkerPosition = {
                latitude: location.lat,
                longitude: location.lng,
              };
              setRegion(initialMarkerPosition);
              setMarkerPosition(initialMarkerPosition);
              setLoading(false);
            })
            .catch((error) => {
              if (
                error?.origin?.status === "ZERO_RESULTS" &&
                config.location_type === "local" &&
                listing_locations.length
              ) {
                let onlyAddress = listing_locations.map(
                  (_location) => _location.name
                );
                Geocoder.from(decodeString(onlyAddress.join(", ")))
                  .then((json) => {
                    var location = json.results[0].geometry.location;
                    const initialMarkerPosition2 = {
                      latitude: location.lat,
                      longitude: location.lng,
                    };
                    setRegion(initialMarkerPosition2);
                    setMarkerPosition(initialMarkerPosition2);
                    setLoading(false);
                  })
                  .catch((error) => {
                    if (error?.origin?.status === "REQUEST_DENIED") {
                      setGeoCoderFailedMessage(error.origin.error_message);
                      setGeoCoderFail(true);
                      setLoading(false);
                    }
                  });
              }
              if (error?.origin?.status === "REQUEST_DENIED") {
                setGeoCoderFailedMessage(error.origin.error_message);
                setGeoCoderFail(true);
                setLoading(false);
              }
            });
        } else {
          if (config?.map?.center) {
            const initialMarkerPosition = {
              latitude: parseFloat(config.map.center.lat),
              longitude: parseFloat(config.map.center.lng),
            };
            setRegion(initialMarkerPosition);
            setMarkerPosition(initialMarkerPosition);
          } else {
            const initialMarkerPosition = {
              latitude: 0,
              longitude: 0,
            };
            setRegion(initialMarkerPosition);
            setMarkerPosition(initialMarkerPosition);
          }
          setLoading(false);
          // TODO add event
        }
        removeAuthToken();
      } else {
        // TODO add error storing
        removeAuthToken();
        setLoading(false);
      }
    });
  }, [formData]);

  //  custom fields validation
  useEffect(() => {
    if (!formData) return;
    custom_fieldsValidation(listingData, formData, validateCfDependency);
  }, [listingData, tnCToggle, validateCfDependency]);

  //  common fields validation
  useEffect(() => {
    if (!formData) return;
    commonFieldsValidation();
  }, [listingCommonData, touchedFields, tnCToggle]);

  // Video URL Validation
  useEffect(() => {
    videoURLValidation();
  }, [listingCommonData.video_urls]);

  const videoURLValidation = () => {
    let url = listingCommonData?.video_urls || "";
    if (url != undefined || url != "") {
      const pattern = new RegExp(
        "(https?://)(www.)?(youtube.com/watch[?]v=([a-zA-Z0-9_-]{11}))"
      );
      if (pattern.test(url)) {
        if (videoUrlValid === false) {
          setVideoUrlValid(true);
        }
      } else {
        if (videoUrlValid) {
          setVideoUrlValid(false);
        }
      }
    }
  };

  const handleTextData = (key, value) => {
    setListingData((listingData) => {
      return { ...listingData, [key]: value };
    });
  };

  const handleAddImage = (uri) => {
    setImageUris([uri, ...imageUris]);
    let localUri = uri;
    let filename = localUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);

    const image = {
      uri: localUri,
      name: filename,
      type: mime.getType(localUri),
    };

    setImageObjects([...imageObjects, image]);
  };
  const handleRemoveImage = (uri) => {
    setImageUris(imageUris.filter((imageUri) => imageUri !== uri));
    setImageObjects((imageObjects) => [
      ...imageObjects.filter((item) => item.uri !== uri),
    ]);
  };

  // {* Form Submission *}
  const handleListingFormSubmit = (contact) => {
    setUploadProgress(0);
    setSubmitLoading(true);

    const tempCFData = { ...listingData };
    Object.keys(listingData).map((_key) => {
      if (
        !validateCfDependency.includes(
          parseInt(_key.replace("_field_", ""), 10)
        )
      ) {
        delete tempCFData[_key];
      }
    });

    const data = {
      ["custom_fields"]: tempCFData,
      ...listingCommonData,
      ...contact,
      ["locations"]: [],
      ["category_id"]: catId,
      ["agree"]: 1,
      ["gallery"]: imageObjects,
      ["listing_type"]: type.id,
      ["hide_map"]: hideMap ? 1 : 0,
      ...markerPosition,
      ["social_profiles"]: { ...socialProfiles },
      ["active_bhs"]: bHActive ? 1 : 0,
      ["active_special_bhs"]: defaultSBH.length ? 1 : 0,
      bhs: defaultBH,
      special_bhs: defaultSBH,
    };

    if (config.location_type === "local" && listing_locations.length) {
      for (const item of listing_locations) {
        data.locations.push(item.term_id);
      }
    }
    if (config.location_type === "google" && listingGeoAddress) {
      data["geo_address"] = listingGeoAddress;
    }

    setAuthToken(auth_token);
    if (data.gallery.length) {
      setHasImage(true);
      const formData = new FormData();
      Object.keys(data).map((key) => {
        if (key === "custom_fields") {
          Object.keys(data[key]).map((innerKey) => {
            formData.append(
              "custom_fields[" + innerKey + "]",
              Array.isArray(data[key][innerKey])
                ? JSON.stringify(data[key][innerKey])
                : data[key][innerKey]
            );
          });
        } else if (key === "bhs" || key === "special_bhs") {
          const data_value = data[key];
          Object.keys(data[key]).map((innerKey) => {
            const main_key = key + "[" + innerKey + "]";
            const main_value = data[key][innerKey];

            if (main_value && main_value.constructor === {}.constructor) {
              Object.keys(main_value).map((_ik) => {
                const _iv = main_value[_ik];
                if (_ik === "times" && Array.isArray(_iv) && _iv.length) {
                  _iv.map((_iTimesOb, _index) => {
                    if (_iTimesOb.start && _iTimesOb.end) {
                      formData.append(
                        `${main_key}[${_ik}][${_index}][end]`,
                        _iTimesOb.end
                      );
                      formData.append(
                        `${main_key}[${_ik}][${_index}][start]`,
                        _iTimesOb.start
                      );
                    }
                  });
                } else if (_ik === "open") {
                  formData.append(main_key + "[" + _ik + "]", !!_iv);
                } else {
                  formData.append(main_key + "[" + _ik + "]", _iv);
                }
              });
            }
          });
        } else if (data[key] && Array.isArray(data[key])) {
          data[key].length &&
            data[key].map((image) => {
              formData.append(key + "[]", image);
            });
        } else if (data[key] && data[key].constructor === {}.constructor) {
          Object.keys(data[key]).map((innerKey) => {
            formData.append(key + "[" + innerKey + "]", data[key][innerKey]);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      setMultipartHeader();
      api
        .post("listing/form", formData, {
          onUploadProgress: (value) => progressValue(value),
        })
        .then((res) => {
          if (res.ok) {
            removeMultipartHeader();
            removeAuthToken();
            setHasImage(false);
            setSuccess(true);
          } else {
            // TODO add error storing

            removeMultipartHeader();
            removeAuthToken();
            setHasImage(false);
            setError(true);
            // setSubmitLoading((submitLoading) => false);
          }
        });
    } else {
      delete data.gallery;
      api.post("listing/form", data).then((res) => {
        if (res.ok) {
          removeAuthToken();
          setSuccess(true);
        } else {
          // TODO add error storing

          removeAuthToken();
          setError(true);
        }
      });
    }
  };

  const progressValue = (value) => {
    setUploadProgress(value.loaded / value.total);
  };

  const custom_fieldsValidation = (
    listingData,
    formData,
    validateCfDependency
  ) => {
    const requiredFields = formData.custom_fields.filter(
      (field) => field.required && validateCfDependency.includes(field.id)
    );

    const errorData = requiredFields.filter((item) => {
      if (item.type === "checkbox") {
        if (listingData[item.meta_key]) {
          return listingData[item.meta_key].length < 1;
        } else {
          return true;
        }
      } else {
        return !listingData[item.meta_key];
      }
    });
    const errorsObject = {};
    errorData.map((err) => {
      const val = `${err.label} is required`;
      errorsObject[err.meta_key] = val;
    });
    setCustomFieldsError(errorsObject);
  };
  const commonFieldsValidation = () => {
    const errorData = commonRequiredFields.filter((item) => {
      if (listingCommonData[item]) {
        return false;
      } else {
        return true;
      }
    });
    setCommonFieldsError(errorData);
  };

  const handleDateTime = (payLoad, field) => {
    setListingData((prevListingData) => {
      return {
        ...prevListingData,
        [field.meta_key]: moment(payLoad).format(field.date.jsFormat),
      };
    });
    setTouchedFields((prevtouchedFields) =>
      Array.from(new Set([...prevtouchedFields, field.meta_key]))
    );
  };

  const handleDateTimeRange = (type, payLoad, field) => {
    if (type === "start") {
      const newRangeStart = [
        moment(payLoad).format(field.date.jsFormat),
        listingData[field.meta_key]
          ? listingData[field.meta_key][1]
            ? listingData[field.meta_key][1]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
      ];
      setListingData((prevListingData) => {
        return { ...prevListingData, [field.meta_key]: newRangeStart };
      });
    } else {
      const newRangeEnd = [
        listingData[field.meta_key]
          ? listingData[field.meta_key][0]
            ? listingData[field.meta_key][0]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
        moment(payLoad).format(field.date.jsFormat),
      ];
      setListingData((prevListingData) => {
        return { ...prevListingData, [field.meta_key]: newRangeEnd };
      });
    }
    setTouchedFields((prevtouchedFields) =>
      Array.from(new Set([...prevtouchedFields, field.meta_key]))
    );
  };

  const handleTnCShow = () => {
    setTnCVisible(!tnCVisible);
  };

  const handleImageReorder = (data) => {
    setImageUris(data);

    const reorderedImageData = data.map((_uri) => {
      let localUri = _uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      return {
        uri: localUri,
        name: filename,
        type,
      };
    });
    setImageObjects(reorderedImageData);
  };

  const handleEventOnAnimationDone = () => {
    setSuccess(false);
    if (success) {
      setSubmitLoading(false);
      goBack();
    }
  };

  const updatePriceType = (item) => {
    setListingCommonData((prevListingCommonData) => {
      return {
        ...prevListingCommonData,
        ["price_type"]: item.id,
      };
    });
    if (item.id === "on_call") {
      const tempComReqFields = commonRequiredFields.filter(
        (field) => !["price", "max_price"].includes(field)
      );
      setCommonRequiredFields(tempComReqFields);
    } else {
      if (listingCommonData.pricing_type === "range") {
        const tempComReqFields = Array.from(
          new Set([...commonRequiredFields, "price", "max_price"])
        );
        setCommonRequiredFields(tempComReqFields);
      }
      if (listingCommonData.pricing_type === "price") {
        const tempComReqFields = Array.from(
          new Set([...commonRequiredFields, "price"])
        );
        setCommonRequiredFields(tempComReqFields);
      }
    }
  };

  const updatePricingType = (item) => {
    setListingCommonData((prevListingCommonData) => {
      return {
        ...prevListingCommonData,
        ["pricing_type"]: item.id,
      };
    });
    if (item.id === "disabled") {
      const tempComReqFields = commonRequiredFields.filter(
        (field) => !["price", "max_price", "price_type"].includes(field)
      );
      setCommonRequiredFields(tempComReqFields);
    } else {
      if (item.id === "price") {
        const tempComReqFields = Array.from(
          new Set([...commonRequiredFields, "price"])
        ).filter((field) => field !== "max_price");

        setCommonRequiredFields(tempComReqFields);
        if (Object.keys(listingCommonData).includes("max_price")) {
          delete listingCommonData.max_price;
        }
      }
      if (item.id === "range") {
        const tempComReqFields = Array.from(
          new Set([...commonRequiredFields, "price", "max_price"])
        );
        setCommonRequiredFields(tempComReqFields);
      }
    }
  };

  const handleMapTypeChange = () => {
    if (mapType == "standard") {
      setMapType("hybrid");
    } else {
      setMapType("standard");
    }
  };

  const handleMarkerReleaseEvent = (coords, func) => {
    setLocationLoading(true);
    setRegion(coords);
    setMarkerPosition(coords);

    Geocoder.from(coords.latitude, coords.longitude)
      .then((json) => {
        var addressComponent = json.results[0].formatted_address;
        if (config.location_type === "local") {
          if (addressComponent) {
            func("address", addressComponent);
          }
          const postalCode = json.results[0].address_components.filter((comp) =>
            comp.types.includes("postal_code")
          );
          if (postalCode.length) {
            func("zipcode", postalCode[0].long_name);
          } else {
            func("zipcode", "");
          }
        } else {
          if (addressComponent) {
            setListingGeoAddress(addressComponent);
          }
        }
      })
      .catch((error) => {
        console.warn(error);
        // TODO  display error
      });

    setLocationLoading(false);
  };

  const handleReGeocoding = (values, payload) => {
    let geoAddress = [];
    if (payload.address) {
      geoAddress.push(payload.address);
    } else {
      geoAddress.push(values.address);
    }
    if (payload.zipcode) {
      geoAddress.push(payload.zipcode);
    } else {
      geoAddress.push(values.zipcode);
    }
    if (config.location_type === "local" && listing_locations.length) {
      listing_locations.map((_location) => geoAddress.push(_location.name));
    }
    geoAddress = geoAddress.length ? decodeString(geoAddress.join(", ")) : "";
    handleGetGeoLatLng(geoAddress);
  };

  const handleGetGeoLatLng = useCallback(
    debounce((data) => {
      setLocationLoading(true);

      Geocoder.from(data)
        .then((json) => {
          var location = json.results[0].geometry.location;
          const position = {
            latitude: location.lat,
            longitude: location.lng,
          };
          setRegion(position);
          setMarkerPosition(position);
          setLocationLoading(false);
        })
        .catch((error) => {
          // TODO : error notice
          setLocationLoading(false);
        });
    }, 500),
    []
  );

  const handleGetDeviceLocation = (func) => {
    setLocationLoading(true);
    getLocationPermissionAsync(func);
  };

  const getLocationPermissionAsync = async (func) => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Need to enable Location permission to use this feature");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setMarkerPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    Geocoder.from(location.coords.latitude, location.coords.longitude)
      .then((json) => {
        var addressComponent = json.results[0].formatted_address;
        if (config.location_type === "local") {
          if (addressComponent) {
            func("address", addressComponent);
          } else {
            func("address", "");
          }
          const postalCode = json.results[0].address_components.filter((comp) =>
            comp.types.includes("postal_code")
          );
          if (postalCode.length) {
            func("zipcode", postalCode[0].long_name);
          } else {
            func("zipcode", "");
          }
        } else {
          if (addressComponent) {
            setListingGeoAddress(addressComponent);
          }
        }
      })
      .catch((error) => {
        console.warn(error);
        // TODO  display error
      });

    setLocationLoading(false);
  };

  const handleSocialProfilesValues = (text, profile) => {
    const tempSclPrfl = { ...socialProfiles, [profile]: text.trim() };
    setSocialProfiles(tempSclPrfl);
    socialProfileValidation(text.trim(), profile);
  };

  const socialProfileValidation = useCallback(
    debounce((text, profile) => {
      let url = text;
      if (url.length > 0) {
        const valid =
          /((http|https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/.test(
            url
          );
        if (valid) {
          const tempErr = socialErrors.filter((_err) => _err !== profile);
          setSocialErrors(tempErr);
        } else {
          setSocialErrors((prevSocialErrors) =>
            Array.from(new Set([...prevSocialErrors, profile]))
          );
        }
      } else {
        const tempErr = socialErrors.filter((_err) => _err !== profile);
        setSocialErrors(tempErr);
      }
    }, 500),
    []
  );

  const handleBHToggle = () => {
    setBHActive((prevBHActive) => !prevBHActive);
  };

  const BHComponent = ({ day, dayName }) => (
    <View style={styles.bHDayWrap}>
      <View style={styles.bHDayLeftWrap}>
        <Text style={styles.bHDayName} numberOfLines={1}>
          {dayName}
        </Text>
      </View>
      <View style={styles.bHDayRightWrap}>
        <TouchableOpacity
          style={styles.openButtonWrap}
          onPress={() => handleBHDayOpenBtnPress(day)}
        >
          <MaterialCommunityIcons
            name={
              defaultBH[day].open ? "checkbox-marked" : "checkbox-blank-outline"
            }
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.text}>
            {__("listingFormTexts.bHOpenBtnTitle", appSettings.lng)}
          </Text>
        </TouchableOpacity>
        {defaultBH[day].open && (
          <>
            <TouchableOpacity
              style={styles.timeSlotToggleBtnWrap}
              onPress={() => handletimeSlotToggleBtnPress(day)}
            >
              <MaterialCommunityIcons
                name={
                  !!defaultBH[day]?.times
                    ? "checkbox-marked"
                    : "checkbox-blank-outline"
                }
                size={24}
                color={COLORS.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>
                  {__("listingFormTexts.timeSlotToggleButton", appSettings.lng)}
                </Text>
              </View>
            </TouchableOpacity>
            {!!defaultBH[day]?.times && (
              <View style={styles.timeSlotsWrap}>
                {defaultBH[day].times.map((_slot, index, arr) => (
                  <View style={styles.timeSlot} key={index}>
                    <View style={styles.timeSltStartWrap}>
                      <Text style={[styles.bHDayName, { marginBottom: 5 }]}>
                        {__(
                          "listingFormTexts.timeSlotStartTitle",
                          appSettings.lng
                        )}
                      </Text>
                      <View style={styles.slotTimeWrap}>
                        <BHTimePicker
                          value={_slot.start}
                          type="start"
                          day={day}
                          onSelectTime={handleBHTimePickerEvent}
                          serial={index}
                          is12hr={
                            config.store?.time_options?.showMeridian ?? true
                          }
                        />
                      </View>
                    </View>
                    <View style={styles.timeSltEndWrap}>
                      <Text style={[styles.bHDayName, { marginBottom: 5 }]}>
                        {__(
                          "listingFormTexts.timeSlotEndTitle",
                          appSettings.lng
                        )}
                      </Text>
                      <View style={styles.slotTimeWrap}>
                        <BHTimePicker
                          value={_slot.end}
                          type="end"
                          day={day}
                          onSelectTime={handleBHTimePickerEvent}
                          serial={index}
                          is12hr={
                            config.store?.time_options?.showMeridian ?? true
                          }
                        />
                      </View>
                    </View>
                    <View style={styles.btnWrap}>
                      {arr.length > 1 && (
                        <TouchableOpacity
                          style={[styles.sltDltBtn, { flex: 0.5 }]}
                          onPress={() => handleTimeSltDlt(day, index)}
                        >
                          <FontAwesome
                            name="minus-circle"
                            size={20}
                            color={COLORS.primary}
                          />
                        </TouchableOpacity>
                      )}

                      {index === arr.length - 1 && (
                        <TouchableOpacity
                          style={[styles.sltAddBtn, { flex: 0.5 }]}
                          onPress={() => handleTimeSltAdd(day, index)}
                        >
                          <FontAwesome
                            name="plus-circle"
                            size={20}
                            color={COLORS.primary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );

  const handleBHDayOpenBtnPress = (day) => {
    const tempBHDay = { ...defaultBH[day], open: !defaultBH[day].open };
    if (!tempBHDay.open) {
      delete tempBHDay.times;
    }
    setDefaultBH({ ...defaultBH, [day]: tempBHDay });
  };

  const handletimeSlotToggleBtnPress = (day) => {
    const format = config.datetime_fmt.time || "h:mm a";
    const tempTimeSlot = {
      start: moment("8:00 am", "h:mm a").format(format),
      end: moment("8:00 pm", "h:mm a").format(format),
    };
    let tempBHDay = { ...defaultBH[day] };
    if (!!tempBHDay?.times) {
      delete tempBHDay.times;
    } else {
      tempBHDay["times"] = [tempTimeSlot];
    }
    setDefaultBH({ ...defaultBH, [day]: tempBHDay });
  };

  const handleTimeSltAdd = (day) => {
    const format = config.datetime_fmt.time || "h:mm a";
    const tempTimeSlot = {
      start: moment("8:00 am", "h:mm a").format(format),
      end: moment("8:00 pm", "h:mm a").format(format),
    };
    const tempBHDay = {
      ...defaultBH[day],
      times: [...defaultBH[day].times, tempTimeSlot],
    };
    const tempBH = { ...defaultBH, [day]: tempBHDay };
    setDefaultBH(tempBH);
  };

  const handleTimeSltDlt = (day, index) => {
    const tempTimes = defaultBH[day].times.filter(
      (_timeSlots, _index) => _index !== index
    );

    const tempBH = {
      ...defaultBH,
      [day]: {
        ...defaultBH[day],
        times: tempTimes,
      },
    };
    setDefaultBH(tempBH);
  };

  const handleBHTimePickerEvent = (day, type, payload, serial) => {
    const format = config.datetime_fmt.time || "h:mm a";

    let tempBHDay = { ...defaultBH[day] };
    let tempTimeSlts = [...defaultBH[day].times];
    let temptimeSlt = { ...defaultBH[day].times[serial] };

    if (type === "start") {
      temptimeSlt["start"] = moment(payload).format(format);
    } else {
      temptimeSlt["end"] = moment(payload).format(format);
    }
    tempTimeSlts[serial] = temptimeSlt;
    tempBHDay["times"] = tempTimeSlts;

    setDefaultBH({ ...defaultBH, [day]: tempBHDay });
  };

  const SBHComponent = ({ specialDay, dataArray }) => (
    <View
      style={[
        styles.bHDayWrap,
        { alignItems: defaultSBH[specialDay].open ? "flex-start" : "center" },
      ]}
    >
      <View
        style={{
          borderRadius: 2,
          borderWidth: 1,
          borderColor: COLORS.gray,

          flex: 1,
          overflow: "hidden",
        }}
      >
        <View style={{ padding: 5 }}>
          <SBHDatePicker
            day={specialDay}
            onSelectDate={handleSBHDateEvent}
            value={defaultSBH[specialDay].date}
          />
        </View>
      </View>
      <View style={styles.bHDayRightWrap}>
        <View style={{ paddingLeft: 5 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={[styles.openButtonWrap, { flex: 1 }]}
              onPress={() => handleSBHDayOpenBtnPress(specialDay)}
            >
              <MaterialCommunityIcons
                name={
                  defaultSBH[specialDay].open
                    ? "checkbox-marked"
                    : "checkbox-blank-outline"
                }
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.text}>
                {__("listingFormTexts.bHOpenBtnTitle", appSettings.lng)}
              </Text>
            </TouchableOpacity>

            {dataArray.length > 1 && (
              <TouchableOpacity
                style={[styles.sltDltBtn, { marginHorizontal: 10 }]}
                onPress={() => handleSpecialDayDlt(specialDay)}
              >
                <FontAwesome
                  name="minus-circle"
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}

            {specialDay === dataArray.length - 1 && (
              <TouchableOpacity
                style={[styles.sltAddBtn, {}]}
                onPress={() => handleSpecialDayAdd()}
              >
                <FontAwesome
                  name="plus-circle"
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          {defaultSBH[specialDay].open && (
            <>
              <TouchableOpacity
                style={styles.timeSlotToggleBtnWrap}
                onPress={() => handleSBHtimeSlotToggleBtnPress(specialDay)}
              >
                <MaterialCommunityIcons
                  name={
                    !!defaultSBH[specialDay]?.times
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={24}
                  color={COLORS.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.text}>
                    {__(
                      "listingFormTexts.timeSlotToggleButton",
                      appSettings.lng
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
              {!!defaultSBH[specialDay]?.times && (
                <View style={styles.timeSlotsWrap}>
                  {defaultSBH[specialDay].times.map((_slot, index, arr) => (
                    <View style={styles.timeSlot} key={index}>
                      <View style={styles.timeSltStartWrap}>
                        <Text style={[styles.bHDayName, { marginBottom: 5 }]}>
                          {__(
                            "listingFormTexts.timeSlotStartTitle",
                            appSettings.lng
                          )}
                        </Text>

                        <View style={styles.slotTimeWrap}>
                          <BHTimePicker
                            value={_slot.start}
                            type="start"
                            day={specialDay}
                            onSelectTime={handleSBHTimePickerEvent}
                            serial={index}
                            is12hr={
                              config.store?.time_options?.showMeridian ?? true
                            }
                          />
                        </View>
                      </View>
                      <View style={styles.timeSltEndWrap}>
                        <Text style={[styles.bHDayName, { marginBottom: 5 }]}>
                          {__(
                            "listingFormTexts.timeSlotEndTitle",
                            appSettings.lng
                          )}
                        </Text>

                        <View style={styles.slotTimeWrap}>
                          <BHTimePicker
                            value={_slot.end}
                            type="end"
                            day={specialDay}
                            onSelectTime={handleSBHTimePickerEvent}
                            serial={index}
                            is12hr={
                              config.store?.time_options?.showMeridian ?? true
                            }
                          />
                        </View>
                      </View>
                      <View style={styles.btnWrap}>
                        {arr.length > 1 && (
                          <TouchableOpacity
                            style={[styles.sltDltBtn, { flex: 0.5 }]}
                            onPress={() =>
                              handleSpecialTimeSltDlt(specialDay, index)
                            }
                          >
                            <FontAwesome
                              name="minus-circle"
                              size={20}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        )}

                        {index === arr.length - 1 && (
                          <TouchableOpacity
                            style={[styles.sltAddBtn, { flex: 0.5 }]}
                            onPress={() =>
                              handleSpecialTimeSltAdd(specialDay, index)
                            }
                          >
                            <FontAwesome
                              name="plus-circle"
                              size={20}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );

  const handleSBHDateEvent = (day, payload) => {
    const format = config.datetime_fmt.date || "MMMM D, YYYY";
    const tempSBHDayObj = {
      ...defaultSBH[day],
      date: moment(payload).format(format),
    };

    let tempSBHs = [...defaultSBH];
    tempSBHs[day] = tempSBHDayObj;
    setDefaultSBH(tempSBHs);
  };

  const handleSBHToggle = () => {
    if (defaultSBH.length) {
      setDefaultSBH([]);
    } else {
      setDefaultSBH([
        {
          open: false,
          date: moment(new Date()).format(
            config.datetime_fmt.date || "MMMM D, YYYY"
          ),
        },
      ]);
    }
  };

  const handleSBHDayOpenBtnPress = (index) => {
    const tempSBHObj = { ...defaultSBH[index], open: !defaultSBH[index].open };
    let tempSBHs = [...defaultSBH];
    tempSBHs[index] = tempSBHObj;
    setDefaultSBH(tempSBHs);
  };

  const handleSBHtimeSlotToggleBtnPress = (index) => {
    const format = config.datetime_fmt.time || "h:mm a";

    const tempTimeSlot = {
      start: moment(new Date()).format(format),
      end: moment(new Date()).format(format),
    };
    let tempSBHObj = { ...defaultSBH[index] };
    if (!!tempSBHObj?.times) {
      delete tempSBHObj.times;
    } else {
      tempSBHObj["times"] = [tempTimeSlot];
    }
    let tempSBHs = [...defaultSBH];
    tempSBHs[index] = tempSBHObj;
    setDefaultSBH(tempSBHs);
  };

  const handleSpecialTimeSltAdd = (specialDay) => {
    const format = config.datetime_fmt.time || "h:mm a";
    const tempTimeSlot = {
      start: moment(new Date()).format(format),
      end: moment(new Date()).format(format),
    };

    const tempSBHOBJ = {
      ...defaultSBH[specialDay],
      times: [...defaultSBH[specialDay].times, tempTimeSlot],
    };
    let tempSBH = [...defaultSBH];
    tempSBH[specialDay] = tempSBHOBJ;
    setDefaultSBH(tempSBH);
  };

  const handleSpecialTimeSltDlt = (specialDay, index) => {
    const tempTimes = defaultSBH[specialDay].times.filter(
      (_timeSlt, _index) => _index !== index
    );
    let tempSBH = [...defaultSBH];
    tempSBH[specialDay] = { ...defaultSBH[specialDay], times: tempTimes };
    setDefaultSBH(tempSBH);
  };

  const handleSpecialDayAdd = () => {
    setDefaultSBH((prevSBH) => [
      ...prevSBH,
      {
        open: false,
        date: moment(new Date()).format(
          config.datetime_fmt.date || "MMMM D, YYYY"
        ),
      },
    ]);
  };

  const handleSpecialDayDlt = (specialDay) => {
    const tempSBH = defaultSBH.filter((_sbh, index) => index !== specialDay);
    setDefaultSBH(tempSBH);
  };

  const handleSBHTimePickerEvent = (day, type, payload, serial) => {
    const format = config.datetime_fmt.time || "h:mm a";

    let tempSBHDay = { ...defaultSBH[day] };
    let tempTimeSlts = [...defaultSBH[day].times];
    let temptimeSlt = { ...defaultSBH[day].times[serial] };
    let tempSBH = [...defaultSBH];

    if (type === "start") {
      temptimeSlt["start"] = moment(payload).format(format);
    } else {
      temptimeSlt["end"] = moment(payload).format(format);
    }
    tempTimeSlts[serial] = temptimeSlt;
    tempSBHDay["times"] = tempTimeSlts;
    tempSBH[day] = tempSBHDay;

    setDefaultSBH(tempSBH);
  };

  return (
    <View style={styles.container}>
      {/* Initial Loading Component */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          {/* Common Fields (Image, Title, Pricing Type, Price Type, Price) */}
          <View style={styles.commonFieldsWrap}>
            {/* Image Input Component */}
            {formData?.config?.gallery && (
              <View style={styles.imageInputWrap}>
                {/* Form Section Title Component */}
                <View style={styles.imageInputTitleWrap}>
                  <View style={styles.iconWrap}>
                    <Image
                      style={{
                        height: 25,
                        width: 25,
                        resizeMode: "contain",
                      }}
                      source={require("../assets/gallery_icon.png")}
                    />
                  </View>

                  <Text style={styles.imageInputLabel}>
                    {__("listingFormTexts.imagesLabel", appSettings.lng)}
                  </Text>
                </View>
                <View style={styles.imageInputNotes}>
                  {!!formData.config.gallery.max_image_limit && (
                    <Text style={styles.imageInputNotesText}>
                      {__("listingFormTexts.maxImageCount", appSettings.lng)}
                      {formData.config.gallery.max_image_limit}
                      {__("listingFormTexts.images", appSettings.lng)}
                    </Text>
                  )}
                  {(!formData.config.gallery.max_image_limit ||
                    formData.config.gallery.max_image_limit > 1) && (
                    <Text style={styles.imageInputNotesText}>
                      {__("listingFormTexts.dragSortText", appSettings.lng)}
                    </Text>
                  )}
                </View>
                <ImageInputList
                  imageUris={imageUris}
                  onAddImage={handleAddImage}
                  onRemoveImage={handleRemoveImage}
                  maxCount={formData.config.gallery.max_image_limit}
                  reorder={handleImageReorder}
                />
              </View>
            )}
            {/* Form Section Title Component */}
            <View style={styles.titleWrap}>
              <View style={styles.iconWrap}>
                <Image
                  style={{
                    height: 25,
                    width: 25,
                    resizeMode: "contain",
                  }}
                  source={require("../assets/product_info_icon.png")}
                />
              </View>
              <Text style={styles.title}>
                {__("listingFormTexts.formTitle", appSettings.lng)}
              </Text>
            </View>
            <AppSeparator style={styles.separator} />
            {/* Title Input Component */}
            <View style={styles.inputWrap}>
              <Text style={styles.label}>
                {__("listingFormTexts.listingTitleLabel", appSettings.lng)}
                <Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                style={styles.commonField_Text}
                onChangeText={(value) => {
                  setListingCommonData((listingCommonData) => {
                    return { ...listingCommonData, ["title"]: value };
                  });
                }}
                onBlur={() =>
                  setTouchedFields((prevTouchedFields) =>
                    Array.from(new Set([...prevTouchedFields, "title"]))
                  )
                }
                value={listingCommonData.title}
              />
              <View style={styles.errorWrap}>
                {touchedFields.includes("title") &&
                  !listingCommonData.title && (
                    <Text style={styles.errorMessage}>
                      {__(
                        "listingFormTexts.fieldRequiredErrorMessage",
                        appSettings.lng
                      )}
                    </Text>
                  )}
              </View>
            </View>

            {/* Pricing Type Input Component */}
            {!formData?.config?.hidden_fields?.includes("pricing_type") &&
              formData?.config?.pricing_types && (
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>
                    {__("listingFormTexts.pricingLabel", appSettings.lng)}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.priceTypePickerWrap}>
                    <AppRadioButton
                      field={formData.config.pricing_types}
                      handleClick={updatePricingType}
                      selected={listingCommonData.pricing_type}
                    />
                  </View>
                  <View style={styles.errorWrap}>
                    {touchedFields.includes("pricing_type") &&
                      !listingCommonData.pricing_type && (
                        <Text style={styles.errorMessage}>
                          {__(
                            "listingFormTexts.fieldRequiredErrorMessage",
                            appSettings.lng
                          )}
                        </Text>
                      )}
                  </View>
                </View>
              )}

            {/* Price Type Input Component */}
            {!formData?.config?.hidden_fields?.includes("price_type") &&
              listingCommonData.pricing_type !== "disabled" && (
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>
                    {__("listingFormTexts.priceTypeLabel", appSettings.lng)}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.priceTypePickerWrap}>
                    <AppRadioButton
                      field={formData.config.price_types}
                      handleClick={updatePriceType}
                      selected={listingCommonData.price_type}
                    />
                  </View>
                  <View style={styles.errorWrap}>
                    {touchedFields.includes("price_type") &&
                      !listingCommonData.price_type && (
                        <Text style={styles.errorMessage}>
                          {__(
                            "listingFormTexts.fieldRequiredErrorMessage",
                            appSettings.lng
                          )}
                        </Text>
                      )}
                  </View>
                </View>
              )}
            {/* Price Unit Input Component */}
            {formData?.config?.price_units?.length > 0 &&
              listingCommonData.pricing_type !== "disabled" &&
              listingCommonData.price_type !== "on_call" && (
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>
                    {__("listingFormTexts.priceUnitLabel", appSettings.lng)}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <View style={styles.priceTypePickerWrap}>
                    <TouchableOpacity
                      style={styles.priceTypePicker}
                      onPress={() => {
                        setPriceUnitPickerVisivle(!priceUnitPickerVisivle);
                        setListingCommonData((listingCommonData) => {
                          return {
                            ...listingCommonData,
                            ["price_unit"]: null,
                          };
                        });
                      }}
                    >
                      <Text style={styles.Text}>
                        {listingCommonData.price_unit
                          ? `${listingCommonData.price_unit.name} (${listingCommonData.price_unit.short})`
                          : `Select a ${__(
                              "listingFormTexts.priceUnitLabel",
                              appSettings.lng
                            )}`}
                      </Text>
                      <FontAwesome5
                        name="chevron-down"
                        size={14}
                        color={COLORS.text_gray}
                      />
                    </TouchableOpacity>
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={priceUnitPickerVisivle}
                    >
                      <TouchableWithoutFeedback
                        onPress={() => setPriceUnitPickerVisivle(false)}
                      >
                        <View style={styles.modalOverlay} />
                      </TouchableWithoutFeedback>
                      <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                          <Text style={styles.modalText}>{`== Select a ${__(
                            "listingFormTexts.priceUnitLabel",
                            appSettings.lng
                          )} ==`}</Text>
                          <ScrollView
                            contentContainerStyle={{
                              display: "flex",
                              width: "100%",
                              alignItems: "flex-start",
                            }}
                          >
                            {formData.config.price_units.map((item) => (
                              <TouchableOpacity
                                style={styles.pickerOptions}
                                key={`${item.id}`}
                                onPress={() => {
                                  setPriceUnitPickerVisivle(false);
                                  setListingCommonData((listingCommonData) => {
                                    return {
                                      ...listingCommonData,
                                      ["price_unit"]: item,
                                    };
                                  });
                                }}
                              >
                                <Text style={styles.pickerOptionsText}>
                                  {item.name} ({item.short})
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    </Modal>
                  </View>
                  <View style={styles.errorWrap}>
                    {touchedFields.includes("price_unit") &&
                      !listingCommonData.price_unit && (
                        <Text style={styles.errorMessage}>
                          {__(
                            "listingFormTexts.fieldRequiredErrorMessage",
                            appSettings.lng
                          )}
                        </Text>
                      )}
                  </View>
                </View>
              )}

            {/* Price Input Component */}
            {!formData?.config?.hidden_fields?.includes("price") &&
              listingCommonData.pricing_type !== "disabled" &&
              listingCommonData.price_type !== "on_call" && (
                <>
                  {listingCommonData.pricing_type !== "range" ? (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {`${__(
                          "listingFormTexts.priceLabel",
                          appSettings.lng
                        )} (${getCurrencySymbol(config.currency)})`}
                        {listingCommonData.price_type !== "on_call" && (
                          <Text style={styles.required}> *</Text>
                        )}
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={(value) => {
                          setListingCommonData((listingCommonData) => {
                            return { ...listingCommonData, ["price"]: value };
                          });
                        }}
                        value={listingCommonData.price}
                        keyboardType="decimal-pad"
                        onBlur={() =>
                          setTouchedFields((prevTouchedFields) =>
                            Array.from(new Set([...prevTouchedFields, "price"]))
                          )
                        }
                      />
                      <View style={styles.errorWrap}>
                        {touchedFields.includes("price") &&
                          listingCommonData.price_type !== "on_call" &&
                          !listingCommonData.price && (
                            <Text style={styles.errorMessage}>
                              {__(
                                "listingFormTexts.fieldRequiredErrorMessage",
                                appSettings.lng
                              )}
                            </Text>
                          )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.inputWrap}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ width: "48.5%" }}>
                          <Text style={styles.label}>
                            {`${__(
                              "listingFormTexts.priceLabel",
                              appSettings.lng
                            )} (${getCurrencySymbol(config.currency)})`}
                            {listingCommonData.price_type !== "on_call" && (
                              <Text style={styles.required}> *</Text>
                            )}
                          </Text>
                          <TextInput
                            style={styles.commonField_Text}
                            onChangeText={(value) => {
                              setListingCommonData((listingCommonData) => {
                                return {
                                  ...listingCommonData,
                                  ["price"]: value,
                                };
                              });
                            }}
                            value={listingCommonData.price}
                            keyboardType="decimal-pad"
                            onBlur={() =>
                              setTouchedFields((prevTouchedFields) =>
                                Array.from(
                                  new Set([...prevTouchedFields, "price"])
                                )
                              )
                            }
                          />
                          <View style={styles.errorWrap}>
                            {touchedFields.includes("price") &&
                              listingCommonData.price_type !== "on_call" &&
                              !listingCommonData.price && (
                                <Text style={styles.errorMessage}>
                                  {__(
                                    "listingFormTexts.fieldRequiredErrorMessage",
                                    appSettings.lng
                                  )}
                                </Text>
                              )}
                          </View>
                        </View>
                        <View style={{ width: "48.5%" }}>
                          <Text style={styles.label}>
                            {`${__(
                              "listingFormTexts.maxPriceLabel",
                              appSettings.lng
                            )} (${getCurrencySymbol(config.currency)})`}
                            {listingCommonData.price_type !== "on_call" &&
                              listingCommonData.pricing_type === "range" && (
                                <Text style={styles.required}> *</Text>
                              )}
                          </Text>
                          <TextInput
                            style={styles.commonField_Text}
                            onChangeText={(value) => {
                              setListingCommonData((listingCommonData) => {
                                return {
                                  ...listingCommonData,
                                  ["max_price"]: value,
                                };
                              });
                            }}
                            value={listingCommonData.max_price}
                            keyboardType="decimal-pad"
                            onBlur={() =>
                              setTouchedFields((prevTouchedFields) =>
                                Array.from(
                                  new Set([...prevTouchedFields, "max_price"])
                                )
                              )
                            }
                          />
                          <View style={styles.errorWrap}>
                            {touchedFields.includes("max_price") &&
                              listingCommonData.price_type !== "on_call" &&
                              listingCommonData.pricing_type === "range" &&
                              !listingCommonData.max_price && (
                                <Text style={styles.errorMessage}>
                                  {__(
                                    "listingFormTexts.fieldRequiredErrorMessage",
                                    appSettings.lng
                                  )}
                                </Text>
                              )}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
          </View>
          {/* Custom Fields */}
          {!!formData?.custom_fields?.length && (
            <View style={styles.customFieldsWrap}>
              {formData.custom_fields.map((field) => (
                <View key={field.meta_key} style={styles.metaField}>
                  {validateCfDependency.includes(field.id) && (
                    <>
                      <Text style={styles.label}>
                        {decodeString(field.label)}
                        {field.required && (
                          <Text style={styles.required}> *</Text>
                        )}
                      </Text>
                      {(field.type === "text" ||
                        field.type === "textarea" ||
                        field.type === "url" ||
                        field.type === "number") && (
                        <TextInput
                          style={
                            field.type === "textarea"
                              ? styles.metaField_TextArea
                              : styles.metaField_Text
                          }
                          onChangeText={(value) => {
                            handleTextData(field.meta_key, value);
                          }}
                          value={
                            listingData[field.meta_key]
                              ? listingData[field.meta_key]
                              : ""
                          }
                          textAlignVertical={
                            field.type === "textarea" ? "top" : "auto"
                          }
                          multiline={field.type === "textarea"}
                          keyboardType={
                            field.type === "number" ? "decimal-pad" : "default"
                          }
                          contextMenuHidden={field.type === "number"}
                          placeholder={field.placeholder}
                          onBlur={() =>
                            setTouchedFields((prevtouchedFields) =>
                              Array.from(
                                new Set([...prevtouchedFields, field.meta_key])
                              )
                            )
                          }
                        />
                      )}
                      {field.type === "select" && (
                        <View style={styles.dynamicPickerWrap}>
                          <DynamicListPicker
                            field={field}
                            handleTouch={() =>
                              setTouchedFields((prevtouchedFields) =>
                                Array.from(
                                  new Set([
                                    ...prevtouchedFields,
                                    field.meta_key,
                                  ])
                                )
                              )
                            }
                            onselect={(item) => {
                              setListingData((listingData) => {
                                return {
                                  ...listingData,
                                  [field.meta_key]: item.id,
                                };
                              });
                            }}
                          />
                        </View>
                      )}
                      {field.type === "radio" && (
                        <View style={styles.dynamicRadioWrap}>
                          <DynamicRadioButton
                            field={field}
                            handleClick={(item) => {
                              setListingData((listingData) => {
                                return {
                                  ...listingData,
                                  [field.meta_key]: item.id,
                                };
                              });
                              setTouchedFields((prevtouchedFields) =>
                                Array.from(
                                  new Set([
                                    ...prevtouchedFields,
                                    field.meta_key,
                                  ])
                                )
                              );
                            }}
                          />
                        </View>
                      )}
                      {field.type === "checkbox" && (
                        <View style={styles.dynamicCheckboxWrap}>
                          <DynamicCheckbox
                            field={field}
                            handleClick={(value) => {
                              setListingData((listingData) => {
                                return {
                                  ...listingData,
                                  [field.meta_key]: value,
                                };
                              });
                              setTouchedFields((prevtouchedFields) =>
                                Array.from(
                                  new Set([
                                    ...prevtouchedFields,
                                    field.meta_key,
                                  ])
                                )
                              );
                            }}
                          />
                        </View>
                      )}
                      {field.type === "date" && (
                        <View style={styles.dateFieldWrap}>
                          {["date", "date_time"].includes(field.date.type) && (
                            <DatePicker
                              field={field}
                              onSelect={handleDateTime}
                              value={
                                listingData[field.meta_key]
                                  ? listingData[field.meta_key]
                                  : null
                              }
                            />
                          )}
                          {["date_range", "date_time_range"].includes(
                            field.date.type
                          ) && (
                            <DateRangePicker
                              field={field}
                              value={
                                listingData[field.meta_key]
                                  ? listingData[field.meta_key]
                                  : null
                              }
                              onSelect={handleDateTimeRange}
                            />
                          )}
                        </View>
                      )}
                      <View style={styles.errorWrap}>
                        {customFieldsErrors[field.meta_key] &&
                          touchedFields.includes(field.meta_key) && (
                            <Text style={styles.errorMessage}>
                              {customFieldsErrors[field.meta_key]}
                            </Text>
                          )}
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
          {/* Common Fields (Description) */}
          <View style={styles.commonFieldsWrap}>
            {formData?.config?.video_urls && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  {__("listingFormTexts.videoURLLabel", appSettings.lng)}
                </Text>
                <TextInput
                  style={styles.commonField_Text}
                  onChangeText={(value) => {
                    setListingCommonData((listingCommonData) => {
                      return { ...listingCommonData, ["video_urls"]: value };
                    });
                  }}
                  onBlur={() =>
                    setTouchedFields((prevTouchedFields) =>
                      Array.from(new Set([...prevTouchedFields, "video_urls"]))
                    )
                  }
                  value={listingCommonData.video_urls}
                />
                <Text style={styles.Text}>
                  {__("listingFormTexts.videoURLNote", appSettings.lng)}
                </Text>
                <View style={styles.errorWrap}>
                  {touchedFields.includes("video_urls") &&
                    !videoUrlValid &&
                    !!listingCommonData.video_urls && (
                      <Text style={styles.errorMessage}>
                        {__(
                          "listingFormTexts.videoURLInvalid",
                          appSettings.lng
                        )}
                      </Text>
                    )}
                </View>
              </View>
            )}

            {!formData?.config?.hidden_fields?.includes("description") && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  {__(
                    "listingFormTexts.listingDescriptionLabel",
                    appSettings.lng
                  )}
                </Text>
                <TextInput
                  style={styles.metaField_TextArea}
                  onChangeText={(value) => {
                    setListingCommonData((listingCommonData) => {
                      return {
                        ...listingCommonData,
                        ["description"]: value,
                      };
                    });
                  }}
                  value={listingCommonData.description}
                  textAlignVertical="top"
                  multiline
                  placeholder={__(
                    "listingFormTexts.listingDescriptionLabel",
                    appSettings.lng
                  )}
                />
              </View>
            )}
          </View>
          {/* Business Hours Componenet */}
          {formData?.config?.bhs && (
            <View style={styles.bHWrap}>
              <View style={styles.contactTitleWrap}>
                <View style={styles.iconWrap}>
                  <FontAwesome
                    name="clock-o"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.title}>
                  {__("listingFormTexts.businessHoursTitle", appSettings.lng)}
                </Text>
              </View>
              <AppSeparator style={styles.separator} />
              <View style={styles.bHContentWrap}>
                <View style={styles.bHToggleBtnWrap}>
                  <TouchableWithoutFeedback
                    style={styles.bHToggleBtnIcon}
                    onPress={handleBHToggle}
                  >
                    <MaterialCommunityIcons
                      name={
                        bHActive ? "checkbox-marked" : "checkbox-blank-outline"
                      }
                      size={24}
                      color={COLORS.primary}
                    />
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    style={styles.bHToggleBtnTextWrap}
                    onPress={handleBHToggle}
                  >
                    <Text style={styles.bHToggleBtnText}>
                      {__(
                        "listingFormTexts.businessHoursToggleTitle",
                        appSettings.lng
                      )}
                    </Text>
                  </TouchableWithoutFeedback>
                </View>

                {bHActive && (
                  <>
                    <View style={styles.bHToggleNoteWrap}>
                      <Text style={styles.bHToggleNote}>
                        {__(
                          "listingFormTexts.businessHoursToggleNote",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.bHs}>
                      {config.week_days.map((_day) => (
                        <BHComponent
                          day={_day.id}
                          dayName={_day.name}
                          key={_day.id}
                        />
                      ))}
                    </View>
                    <View style={styles.sBHs}>
                      <View style={styles.bHToggleBtnWrap}>
                        <TouchableWithoutFeedback
                          style={styles.bHToggleBtnIcon}
                          onPress={handleSBHToggle}
                        >
                          <MaterialCommunityIcons
                            name={
                              !!defaultSBH?.length
                                ? "checkbox-marked"
                                : "checkbox-blank-outline"
                            }
                            size={24}
                            color={COLORS.primary}
                          />
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          style={styles.bHToggleBtnTextWrap}
                          onPress={handleSBHToggle}
                        >
                          <Text style={styles.bHToggleBtnText}>
                            {__(
                              "listingFormTexts.specialHoursToggleTitle",
                              appSettings.lng
                            )}
                          </Text>
                        </TouchableWithoutFeedback>
                      </View>
                      <View style={styles.bHToggleNoteWrap}>
                        <Text style={styles.bHToggleNote}>
                          {__(
                            "listingFormTexts.specialHoursToggleNote",
                            appSettings.lng
                          )}
                        </Text>
                      </View>
                      {defaultSBH.map((_sbh, index, arr) => (
                        <SBHComponent
                          specialDay={index}
                          dataArray={arr}
                          key={index}
                        />
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Contact Information Section */}
          <View style={styles.contactSectionWrap}>
            <View style={styles.contactTitleWrap}>
              <View style={styles.iconWrap}>
                <Image
                  style={{
                    height: 25,
                    width: 25,
                    resizeMode: "contain",
                  }}
                  source={require("../assets/my_profile.png")}
                />
              </View>
              <Text style={styles.title}>
                {__("listingFormTexts.contactTitle", appSettings.lng)}
              </Text>
            </View>
            <AppSeparator style={styles.separator} />
            <Formik
              initialValues={{
                zipcode: user.zipcode ? user.zipcode : "",
                address: user.address ? user.address : "",
                phone: user ? user.phone : "",
                whatsapp_number: user.whatsapp_number
                  ? user.whatsapp_number
                  : "",
                website: user.website ? user.website : "",
                email: user ? user.email : "",
                name: user ? `${user.first_name} ${user.last_name}` : "",
              }}
              onSubmit={handleListingFormSubmit}
              validationSchema={validationSchema_contact}
            >
              {({
                handleChange,
                handleSubmit,
                values,
                errors,
                setFieldTouched,
                touched,
                setFieldValue,
              }) => (
                <View>
                  {!formData.config.hidden_fields.includes("name") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__("listingFormTexts.nameLabel", appSettings.lng)}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("name")}
                        onBlur={() => setFieldTouched("name")}
                        value={values.name}
                        placeholder={__(
                          "listingFormTexts.nameLabel",
                          appSettings.lng
                        )}
                        editable={!user.first_name && !user.last_name}
                      />
                      <View style={styles.errorWrap}>
                        {errors.name && touched.name && (
                          <Text style={styles.errorMessage}>{errors.name}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  {!formData.config.hidden_fields.includes("phone") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__("listingFormTexts.phoneLabel", appSettings.lng)}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("phone")}
                        onBlur={() => setFieldTouched("phone")}
                        value={values.phone}
                        placeholder={__(
                          "listingFormTexts.phoneLabel",
                          appSettings.lng
                        )}
                        keyboardType="phone-pad"
                      />
                      <View style={styles.errorWrap}>
                        {errors.phone && touched.phone && (
                          <Text style={styles.errorMessage}>
                            {errors.phone}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes(
                    "whatsapp_number"
                  ) && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__("listingFormTexts.whatsappLabel", appSettings.lng)}
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("whatsapp_number")}
                        onBlur={() => setFieldTouched("whatsapp_number")}
                        value={values.whatsapp_number}
                        placeholder={__(
                          "listingFormTexts.whatsappLabel",
                          appSettings.lng
                        )}
                        keyboardType="phone-pad"
                      />
                      <Text style={styles.Text}>
                        {__("listingFormTexts.whatsappNote", appSettings.lng)}
                      </Text>
                      <View style={styles.errorWrap}>
                        {errors.whatsapp_number && touched.whatsapp_number && (
                          <Text style={styles.errorMessage}>
                            {errors.whatsapp_number}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("email") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__("listingFormTexts.emailLabel", appSettings.lng)}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("email")}
                        onBlur={() => setFieldTouched("email")}
                        value={values.email}
                        placeholder={__(
                          "listingFormTexts.emailLabel",
                          appSettings.lng
                        )}
                        keyboardType="email-address"
                      />
                      <View style={styles.errorWrap}>
                        {errors.email && touched.email && (
                          <Text style={styles.errorMessage}>
                            {errors.email}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("website") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__("listingFormTexts.websiteLabel", appSettings.lng)}
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("website")}
                        onBlur={() => setFieldTouched("website")}
                        value={values.website}
                        placeholder={__(
                          "listingFormTexts.websiteLabel",
                          appSettings.lng
                        )}
                      />
                      <View style={styles.errorWrap}>
                        {errors.website && touched.website && (
                          <Text style={styles.errorMessage}>
                            {errors.website}{" "}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {!formData.config.hidden_fields.includes("zipcode") &&
                    config.location_type === "local" && (
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {__("listingFormTexts.zipCodeLabel", appSettings.lng)}
                        </Text>
                        <TextInput
                          style={styles.commonField_Text}
                          onChangeText={(text) => {
                            setFieldValue("zipcode", text);
                            if (!geoCoderFail) {
                              handleReGeocoding(values, { zipcode: text });
                            }
                          }}
                          onBlur={() => setFieldTouched("zipcode")}
                          value={values.zipcode}
                          placeholder={__(
                            "listingFormTexts.zipCodeLabel",
                            appSettings.lng
                          )}
                        />
                        <View style={styles.errorWrap}>
                          {errors.zipcode && touched.zipcode && (
                            <Text style={styles.errorMessage}>
                              {errors.zipcode}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  {!formData.config.hidden_fields.includes("address") &&
                    config.location_type === "local" && (
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {__("listingFormTexts.addressLabel", appSettings.lng)}
                        </Text>
                        <TextInput
                          style={styles.commonField_Text}
                          onChangeText={(text) => {
                            setFieldValue("address", text);
                            if (!geoCoderFail) {
                              handleReGeocoding(values, { address: text });
                            }
                          }}
                          onBlur={() => setFieldTouched("address")}
                          value={values.address}
                          placeholder={__(
                            "listingFormTexts.addressLabel",
                            appSettings.lng
                          )}
                          // multiline
                        />
                        <View style={styles.errorWrap}>
                          {errors.address && touched.address && (
                            <Text style={styles.errorMessage}>
                              {errors.address}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  {/* Google Address */}
                  {config.location_type === "google" && !geoCoderFail && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {__(
                          "listingFormTexts.googleAddressLabel",
                          appSettings.lng
                        )}
                        {locationRequired && (
                          <Text style={styles.required}> *</Text>
                        )}
                      </Text>

                      <GooglePlacesAutocomplete
                        placeholder={
                          listingGeoAddress
                            ? listingGeoAddress
                            : "Search Address"
                        }
                        textInputProps={{
                          placeholderTextColor: listingGeoAddress
                            ? COLORS.black
                            : "#b6b6b6",
                        }}
                        onPress={(data, details = null) => {
                          if (data.description) {
                            setListingGeoAddress(
                              (prevListingGeoAddress) => data.description
                            );
                          }
                          if (details.geometry.location) {
                            const geoLocation = {
                              latitude: details.geometry.location.lat,
                              longitude: details.geometry.location.lng,
                            };
                            setRegion((prevRegion) => {
                              return { ...geoLocation };
                            });
                            setMarkerPosition((prevListingGeoAddress) => {
                              return { ...geoLocation };
                            });
                          }
                        }}
                        fetchDetails={true}
                        query={{
                          key: config.map.api_key,
                          language: { autocompleteLanguage },
                        }}
                        debounce={200}
                        timeout={15000} //15 seconds
                      />

                      <View style={styles.errorWrap}>
                        {locationRequired && !listingGeoAddress && (
                          <Text style={styles.errorMessage}>
                            This field is required
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {/* MapView */}
                  {config.map && (
                    <View>
                      {geoCoderFail ? (
                        <View
                          style={{
                            marginHorizontal: "3%",
                          }}
                        >
                          <View style={styles.geoCoderFailWrap}>
                            <Text style={styles.geoCoderFailTitle}>
                              {__(
                                "listingFormTexts.geoCoderFail",
                                appSettings.lng
                              )}
                            </Text>
                            <Text style={styles.geoCoderFailMessage}>
                              {geoCoderFailedMessage}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <>
                          {/* Loading Component Inside Map */}
                          {locationLoading && (
                            <View style={styles.mapOverlay}>
                              <ActivityIndicator
                                size="large"
                                color={COLORS.primary}
                              />
                            </View>
                          )}
                          {/* Map Mode Toggle Button */}
                          <View style={styles.mapViewButtonsWrap}>
                            <TouchableOpacity
                              style={[
                                styles.mapViewButton,
                                {
                                  backgroundColor:
                                    mapType == "standard"
                                      ? COLORS.dodgerblue
                                      : "transparent",
                                },
                              ]}
                              onPress={handleMapTypeChange}
                              disabled={mapType == "standard"}
                            >
                              <Text
                                style={[
                                  styles.mapViewButtonTitle,
                                  {
                                    color:
                                      mapType == "standard"
                                        ? COLORS.white
                                        : COLORS.text_gray,
                                  },
                                ]}
                              >
                                standard
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.mapViewButton,
                                {
                                  backgroundColor:
                                    mapType == "hybrid"
                                      ? COLORS.dodgerblue
                                      : "transparent",
                                },
                              ]}
                              onPress={handleMapTypeChange}
                              disabled={mapType == "hybrid"}
                            >
                              <Text
                                style={[
                                  styles.mapViewButtonTitle,
                                  {
                                    color:
                                      mapType == "hybrid"
                                        ? COLORS.white
                                        : COLORS.text_gray,
                                  },
                                ]}
                              >
                                hybrid
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {/* Map Component */}
                          <MapView
                            ref={mapViewRef}
                            style={{
                              width: screenWidth,
                              height: screenWidth * 0.8,
                            }}
                            region={{
                              ...region,
                              latitudeDelta: 0.0135135,
                              longitudeDelta: 0.0135135 * 0.8,
                            }}
                            provider={MapView.PROVIDER_GOOGLE}
                            mapType={mapType}
                            loadingEnabled={true}
                            loadingIndicatorColor={COLORS.primary_soft}
                            loadingBackgroundColor={COLORS.white}
                          >
                            <Marker
                              coordinate={markerPosition}
                              draggable
                              onDragEnd={(event) =>
                                handleMarkerReleaseEvent(
                                  event.nativeEvent.coordinate,
                                  setFieldValue
                                )
                              }
                            />
                          </MapView>
                          {/* Hide Map Toggle */}
                          <View style={styles.mapDisplayInputWrap}>
                            <TouchableWithoutFeedback
                              onPress={() =>
                                setHideMap((prevHideMap) => !prevHideMap)
                              }
                            >
                              <View style={styles.mapCheckboxWrap}>
                                <MaterialCommunityIcons
                                  name={
                                    hideMap
                                      ? "checkbox-marked"
                                      : "checkbox-blank-outline"
                                  }
                                  size={20}
                                  color={COLORS.primary}
                                />
                                <Text style={styles.mapToggleTitle}>
                                  {__(
                                    "listingFormTexts.mapToggleTitle",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                          {/* Device Location Button */}
                          <TouchableOpacity
                            style={[
                              styles.deviceLocationButton,
                              ios
                                ? {
                                    shadowColor: "#000",
                                    shadowRadius: 4,
                                    shadowOpacity: 0.2,
                                    shadowOffset: {
                                      height: 2,
                                      width: 2,
                                    },
                                  }
                                : { elevation: 1 },
                            ]}
                            onPress={() =>
                              handleGetDeviceLocation(setFieldValue)
                            }
                            disabled={locationLoading}
                          >
                            <MaterialIcons
                              name="my-location"
                              size={24}
                              color={
                                locationLoading
                                  ? COLORS.primary_soft
                                  : COLORS.primary
                              }
                            />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                  {/* Social Profiles Component */}
                  {!!formData?.config?.social_profiles?.length && (
                    <View style={styles.socialProfilesWrap}>
                      <View style={styles.contactTitleWrap}>
                        <View style={styles.iconWrap}>
                          <FontAwesome
                            name="share-alt"
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                        <Text style={styles.title}>
                          {__(
                            "listingFormTexts.socialProfileTitle",
                            appSettings.lng
                          )}
                        </Text>
                      </View>
                      <AppSeparator style={styles.separator} />
                      <View style={styles.sclPrflsWrap}>
                        {formData?.config?.social_profiles.map((_profile) => (
                          <View style={styles.inputWrap} key={_profile.id}>
                            <Text style={styles.label}>
                              {decodeString(_profile.name)}
                            </Text>
                            <TextInput
                              style={styles.commonField_Text}
                              onChangeText={(text) =>
                                handleSocialProfilesValues(text, _profile.id)
                              }
                              onBlur={() =>
                                setTouchedFields((prevTouchedFields) =>
                                  Array.from(
                                    new Set([...prevTouchedFields, _profile.id])
                                  )
                                )
                              }
                              value={socialProfiles[_profile.id]}
                              placeholder={_profile.name}
                            />
                            <View style={styles.errorWrap}>
                              {socialErrors.includes(_profile.id) &&
                                touchedFields.includes(_profile.id) && (
                                  <Text style={styles.errorMessage}>
                                    {__(
                                      "listingFormTexts.websiteErrorLabel",
                                      appSettings.lng
                                    )}
                                  </Text>
                                )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Terms & Conditions Toggle */}
                  <TouchableOpacity
                    style={styles.tnCToggle}
                    onPress={() => setTnCToggle(!tnCToggle)}
                  >
                    <MaterialCommunityIcons
                      name={
                        tnCToggle ? "checkbox-marked" : "checkbox-blank-outline"
                      }
                      size={24}
                      color={COLORS.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tnCToggleText}>
                        {__("listingFormTexts.tnCToggleText", appSettings.lng)}
                        <Text style={styles.tncText} onPress={handleTnCShow}>
                          {__("listingFormTexts.tncText", appSettings.lng)}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <AppSeparator style={styles.separator} />
                  {/* Submit Button Component */}
                  <View style={{ paddingHorizontal: "3%" }}>
                    <AppButton
                      title={__(
                        "listingFormTexts.submitButtonTitle",
                        appSettings.lng
                      )}
                      style={styles.submitButton}
                      onPress={handleSubmit}
                      loading={submitLoading}
                      disabled={
                        !!Object.keys(errors).length ||
                        !!Object.keys(customFieldsErrors).length ||
                        commonFieldsErrors.length ||
                        !tnCToggle ||
                        (config.location_type === "google" &&
                          !listingGeoAddress &&
                          !geoCoderFail) ||
                        (!videoUrlValid && !!listingCommonData?.video_urls)
                      }
                      textStyle={{ textTransform: "capitalize" }}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </>
      )}
      {/* Terms & Conditions */}
      <Modal animationType="slide" transparent={true} visible={tnCVisible}>
        <SafeAreaView style={styles.tncModal}>
          <ScrollView contentContainerStyle={styles.tnCModalContent}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginTop: 10,
                fontSize: 17,
              }}
            >
              {__("listingFormTexts.tncTitleText", appSettings.lng)}
            </Text>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 10,
              }}
            >
              {tnCData.map((_tnc, index) => (
                <View style={styles.tncParaWrap} key={index}>
                  {!!_tnc.paraTitle && (
                    <Text style={styles.paraTitle}>{_tnc.paraTitle}</Text>
                  )}
                  <Text style={styles.paraData}>{_tnc.paraData}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.tnCClose} onPress={handleTnCShow}>
            <Text style={styles.tnCCloseText}>
              {__("paymentMethodScreen.closeButton", appSettings.lng)}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      {/* Submit Loading */}
      <Modal animationType="slide" transparent={false} visible={submitLoading}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            paddingBottom: 50,
          }}
        >
          {((!!uploadProgress && !success && !error) ||
            (!uploadProgress && !success && !error)) && (
            <View style={{ height: 150, width: 150 }}>
              <UploadingIndicator />
            </View>
          )}
          {!!success && !error && (
            <View style={{ height: 150, width: 150 }}>
              <DoneIndicator
                visible={true}
                onDone={handleEventOnAnimationDone}
              />
            </View>
          )}

          {!success && !!error && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: screenWidth,
                height: screenWidth,
              }}
            >
              <ErrorIndicator
                visible={true}
                onDone={handleEventOnAnimationDone}
              />
              <View style={{ position: "absolute", bottom: "30%" }}>
                <Text style={styles.text}>
                  {__(
                    "listingFormTexts.uploadErrorNoticeText",
                    appSettings.lng
                  )}
                </Text>
              </View>
            </View>
          )}

          {uploadProgress < 1 && hasImage && !success && !error && (
            <Progress.Bar
              progress={uploadProgress}
              width={200}
              color={COLORS.primary}
            />
          )}
          {((uploadProgress < 1 && !success && hasImage && !error) ||
            (!success && !hasImage && !error)) && (
            <Text
              style={{
                fontSize: 15,
                color: COLORS.text_gray,
                textAlign: "center",
                marginTop: 25,
              }}
            >
              {__("listingFormTexts.uploadingNoticeText", appSettings.lng)}
            </Text>
          )}

          {!!error && (
            <View
              style={{
                position: "absolute",
                bottom: 20,
              }}
            >
              <AppButton
                title={__(
                  "listingFormTexts.tryAgainButtonTitle",
                  appSettings.lng
                )}
                onPress={() => setSubmitLoading(false)}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bHContentWrap: {
    marginHorizontal: "3%",
  },
  bHDayLeftWrap: {
    flex: 1,
  },
  bHDayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_gray,
    textTransform: "capitalize",
  },
  bHDayRightWrap: {
    flex: 3,
  },
  bHDayWrap: {
    flexDirection: "row",
    marginVertical: 8,
  },
  bHToggleBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginLeft: 10,
  },
  bHToggleBtnWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  bHToggleNoteWrap: {
    marginTop: 5,
    marginBottom: 15,
  },
  bHWrap: {
    marginTop: 20,
  },
  btnWrap: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    paddingLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
  },
  commonField_Text: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    paddingHorizontal: 5,
    minHeight: 32,
  },

  contactTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: "3%",
  },
  container: {
    marginBottom: screenHeight * 0.1,
    backgroundColor: COLORS.white,
  },
  deviceLocationButton: {
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 40 * 0.25,
    top: screenWidth * 0.8 - 40 * 1.25,
    zIndex: 1,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  errorWrap: {
    minHeight: 17,
  },
  geoCoderFailMessage: {
    color: COLORS.red,
  },
  geoCoderFailTitle: {
    marginBottom: 20,
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  geoCoderFailWrap: {
    padding: "3%",
    alignItems: "center",
    width: screenWidth * 0.94,
    height: screenWidth * 0.6,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    justifyContent: "center",
  },
  iconWrap: {
    height: 25,
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageInputNotes: {
    backgroundColor: "#ffe4d2",
    borderRadius: 3,
    marginTop: 10,
    padding: 10,
  },
  imageInputNotesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f60",
  },
  imageInputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginLeft: 10,
  },
  imageInputTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  imageInputWrap: {
    marginBottom: 15,
  },
  inputWrap: {
    paddingHorizontal: "3%",
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginBottom: 5,
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  locationPrimaryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 3,
    height: 32,
  },
  mapCheckboxWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  mapDisplayInputWrap: {
    paddingHorizontal: "3%",
  },
  mapOverlay: {
    height: screenWidth * 0.8,
    width: "100%",
    backgroundColor: "rgba(0,0,0,.2)",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  mapToggleTitle: {
    paddingLeft: 5,
  },
  mapViewButtonsWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  mapViewButton: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  mapViewButtonTitle: {
    textTransform: "capitalize",
    fontSize: 12,
    fontWeight: "bold",
  },
  metaField: {
    paddingHorizontal: "3%",
  },
  metaField_Text: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    paddingHorizontal: 5,
    minHeight: 32,
  },
  metaField_TextArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    minHeight: screenHeight / 6.5,
    paddingHorizontal: 5,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalText: {
    fontSize: 17,
    paddingBottom: 12,
  },
  modalView: {
    width: "94%",
    backgroundColor: "white",
    borderRadius: 3,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButtonWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  paraTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  pickerOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  pickerOptionsText: {
    fontSize: 16,
    color: COLORS.text_dark,
    textTransform: "capitalize",
    flex: 1,
  },
  priceTypePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    height: 32,
  },
  required: {
    color: "#ff6600",
  },
  separator: {
    width: "94%",
    marginVertical: 20,
    marginHorizontal: "3%",
  },
  slotTimeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  submitButton: {
    width: "100%",
    borderRadius: 3,
    marginTop: 10,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  timeSlotToggleBtnWrap: {
    flexDirection: "row",
    marginTop: 10,
  },
  timeSltEndWrap: {
    flex: 2,
  },
  timeSltStartWrap: {
    marginRight: 10,
    flex: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginLeft: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  tnCClose: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    height: screenHeight / 20,
  },
  tnCCloseText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },
  tncModal: {
    backgroundColor: COLORS.white,
    flex: 1,
    alignItems: "center",
  },
  tnCModalContent: {
    marginHorizontal: "3%",
    marginBottom: screenHeight / 20,
  },
  tnCModalText: {
    color: COLORS.text_dark,
    fontSize: 15,
  },
  tncParaWrap: {
    marginBottom: 20,
  },
  tncText: {
    color: "#ff6600",
  },
  tnCToggle: {
    flexDirection: "row",
    paddingHorizontal: screenWidth * 0.03,
    alignItems: "center",
    marginVertical: 10,
  },
  tnCToggleText: {
    paddingLeft: 5,
  },
});

export default ListingForm;
