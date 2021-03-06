
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const imageToBase64 = require('image-to-base64');
var fs = require('fs');
const Guid = require('guid');
const path = require('path');
const FileReader = require('filereader');
const util = require('util')
var Posts = require('./models/postschema') ;

//Adding ndnjs modules. Replace path here with approprite path to the ndn-js repository
var Face = require('./ndn-js').Face;
var Name = require('./ndn-js').Name;
var Data = require('./ndn-js').Data;
var Blob = require('./ndn-js').Blob;
var UnixTransport = require('./ndn-js').UnixTransport;
var SafeBag = require('./ndn-js').SafeBag;
var KeyChain = require('./ndn-js').KeyChain;


//Private and Public keys for ndn
var DEFAULT_RSA_PUBLIC_KEY_DER = new Buffer([
    0x30, 0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01,
    0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30, 0x82, 0x01, 0x0a, 0x02, 0x82, 0x01, 0x01,
    0x00, 0xb8, 0x09, 0xa7, 0x59, 0x82, 0x84, 0xec, 0x4f, 0x06, 0xfa, 0x1c, 0xb2, 0xe1, 0x38, 0x93,
    0x53, 0xbb, 0x7d, 0xd4, 0xac, 0x88, 0x1a, 0xf8, 0x25, 0x11, 0xe4, 0xfa, 0x1d, 0x61, 0x24, 0x5b,
    0x82, 0xca, 0xcd, 0x72, 0xce, 0xdb, 0x66, 0xb5, 0x8d, 0x54, 0xbd, 0xfb, 0x23, 0xfd, 0xe8, 0x8e,
    0xaf, 0xa7, 0xb3, 0x79, 0xbe, 0x94, 0xb5, 0xb7, 0xba, 0x17, 0xb6, 0x05, 0xae, 0xce, 0x43, 0xbe,
    0x3b, 0xce, 0x6e, 0xea, 0x07, 0xdb, 0xbf, 0x0a, 0x7e, 0xeb, 0xbc, 0xc9, 0x7b, 0x62, 0x3c, 0xf5,
    0xe1, 0xce, 0xe1, 0xd9, 0x8d, 0x9c, 0xfe, 0x1f, 0xc7, 0xf8, 0xfb, 0x59, 0xc0, 0x94, 0x0b, 0x2c,
    0xd9, 0x7d, 0xbc, 0x96, 0xeb, 0xb8, 0x79, 0x22, 0x8a, 0x2e, 0xa0, 0x12, 0x1d, 0x42, 0x07, 0xb6,
    0x5d, 0xdb, 0xe1, 0xf6, 0xb1, 0x5d, 0x7b, 0x1f, 0x54, 0x52, 0x1c, 0xa3, 0x11, 0x9b, 0xf9, 0xeb,
    0xbe, 0xb3, 0x95, 0xca, 0xa5, 0x87, 0x3f, 0x31, 0x18, 0x1a, 0xc9, 0x99, 0x01, 0xec, 0xaa, 0x90,
    0xfd, 0x8a, 0x36, 0x35, 0x5e, 0x12, 0x81, 0xbe, 0x84, 0x88, 0xa1, 0x0d, 0x19, 0x2a, 0x4a, 0x66,
    0xc1, 0x59, 0x3c, 0x41, 0x83, 0x3d, 0x3d, 0xb8, 0xd4, 0xab, 0x34, 0x90, 0x06, 0x3e, 0x1a, 0x61,
    0x74, 0xbe, 0x04, 0xf5, 0x7a, 0x69, 0x1b, 0x9d, 0x56, 0xfc, 0x83, 0xb7, 0x60, 0xc1, 0x5e, 0x9d,
    0x85, 0x34, 0xfd, 0x02, 0x1a, 0xba, 0x2c, 0x09, 0x72, 0xa7, 0x4a, 0x5e, 0x18, 0xbf, 0xc0, 0x58,
    0xa7, 0x49, 0x34, 0x46, 0x61, 0x59, 0x0e, 0xe2, 0x6e, 0x9e, 0xd2, 0xdb, 0xfd, 0x72, 0x2f, 0x3c,
    0x47, 0xcc, 0x5f, 0x99, 0x62, 0xee, 0x0d, 0xf3, 0x1f, 0x30, 0x25, 0x20, 0x92, 0x15, 0x4b, 0x04,
    0xfe, 0x15, 0x19, 0x1d, 0xdc, 0x7e, 0x5c, 0x10, 0x21, 0x52, 0x21, 0x91, 0x54, 0x60, 0x8b, 0x92,
    0x41, 0x02, 0x03, 0x01, 0x00, 0x01
]);


var DEFAULT_RSA_PRIVATE_KEY_DER = new Buffer([
    0x30, 0x82, 0x04, 0xbf, 0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7,
    0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x04, 0x82, 0x04, 0xa9, 0x30, 0x82, 0x04, 0xa5, 0x02, 0x01,
    0x00, 0x02, 0x82, 0x01, 0x01, 0x00, 0xb8, 0x09, 0xa7, 0x59, 0x82, 0x84, 0xec, 0x4f, 0x06, 0xfa,
    0x1c, 0xb2, 0xe1, 0x38, 0x93, 0x53, 0xbb, 0x7d, 0xd4, 0xac, 0x88, 0x1a, 0xf8, 0x25, 0x11, 0xe4,
    0xfa, 0x1d, 0x61, 0x24, 0x5b, 0x82, 0xca, 0xcd, 0x72, 0xce, 0xdb, 0x66, 0xb5, 0x8d, 0x54, 0xbd,
    0xfb, 0x23, 0xfd, 0xe8, 0x8e, 0xaf, 0xa7, 0xb3, 0x79, 0xbe, 0x94, 0xb5, 0xb7, 0xba, 0x17, 0xb6,
    0x05, 0xae, 0xce, 0x43, 0xbe, 0x3b, 0xce, 0x6e, 0xea, 0x07, 0xdb, 0xbf, 0x0a, 0x7e, 0xeb, 0xbc,
    0xc9, 0x7b, 0x62, 0x3c, 0xf5, 0xe1, 0xce, 0xe1, 0xd9, 0x8d, 0x9c, 0xfe, 0x1f, 0xc7, 0xf8, 0xfb,
    0x59, 0xc0, 0x94, 0x0b, 0x2c, 0xd9, 0x7d, 0xbc, 0x96, 0xeb, 0xb8, 0x79, 0x22, 0x8a, 0x2e, 0xa0,
    0x12, 0x1d, 0x42, 0x07, 0xb6, 0x5d, 0xdb, 0xe1, 0xf6, 0xb1, 0x5d, 0x7b, 0x1f, 0x54, 0x52, 0x1c,
    0xa3, 0x11, 0x9b, 0xf9, 0xeb, 0xbe, 0xb3, 0x95, 0xca, 0xa5, 0x87, 0x3f, 0x31, 0x18, 0x1a, 0xc9,
    0x99, 0x01, 0xec, 0xaa, 0x90, 0xfd, 0x8a, 0x36, 0x35, 0x5e, 0x12, 0x81, 0xbe, 0x84, 0x88, 0xa1,
    0x0d, 0x19, 0x2a, 0x4a, 0x66, 0xc1, 0x59, 0x3c, 0x41, 0x83, 0x3d, 0x3d, 0xb8, 0xd4, 0xab, 0x34,
    0x90, 0x06, 0x3e, 0x1a, 0x61, 0x74, 0xbe, 0x04, 0xf5, 0x7a, 0x69, 0x1b, 0x9d, 0x56, 0xfc, 0x83,
    0xb7, 0x60, 0xc1, 0x5e, 0x9d, 0x85, 0x34, 0xfd, 0x02, 0x1a, 0xba, 0x2c, 0x09, 0x72, 0xa7, 0x4a,
    0x5e, 0x18, 0xbf, 0xc0, 0x58, 0xa7, 0x49, 0x34, 0x46, 0x61, 0x59, 0x0e, 0xe2, 0x6e, 0x9e, 0xd2,
    0xdb, 0xfd, 0x72, 0x2f, 0x3c, 0x47, 0xcc, 0x5f, 0x99, 0x62, 0xee, 0x0d, 0xf3, 0x1f, 0x30, 0x25,
    0x20, 0x92, 0x15, 0x4b, 0x04, 0xfe, 0x15, 0x19, 0x1d, 0xdc, 0x7e, 0x5c, 0x10, 0x21, 0x52, 0x21,
    0x91, 0x54, 0x60, 0x8b, 0x92, 0x41, 0x02, 0x03, 0x01, 0x00, 0x01, 0x02, 0x82, 0x01, 0x01, 0x00,
    0x8a, 0x05, 0xfb, 0x73, 0x7f, 0x16, 0xaf, 0x9f, 0xa9, 0x4c, 0xe5, 0x3f, 0x26, 0xf8, 0x66, 0x4d,
    0xd2, 0xfc, 0xd1, 0x06, 0xc0, 0x60, 0xf1, 0x9f, 0xe3, 0xa6, 0xc6, 0x0a, 0x48, 0xb3, 0x9a, 0xca,
    0x21, 0xcd, 0x29, 0x80, 0x88, 0x3d, 0xa4, 0x85, 0xa5, 0x7b, 0x82, 0x21, 0x81, 0x28, 0xeb, 0xf2,
    0x43, 0x24, 0xb0, 0x76, 0xc5, 0x52, 0xef, 0xc2, 0xea, 0x4b, 0x82, 0x41, 0x92, 0xc2, 0x6d, 0xa6,
    0xae, 0xf0, 0xb2, 0x26, 0x48, 0xa1, 0x23, 0x7f, 0x02, 0xcf, 0xa8, 0x90, 0x17, 0xa2, 0x3e, 0x8a,
    0x26, 0xbd, 0x6d, 0x8a, 0xee, 0xa6, 0x0c, 0x31, 0xce, 0xc2, 0xbb, 0x92, 0x59, 0xb5, 0x73, 0xe2,
    0x7d, 0x91, 0x75, 0xe2, 0xbd, 0x8c, 0x63, 0xe2, 0x1c, 0x8b, 0xc2, 0x6a, 0x1c, 0xfe, 0x69, 0xc0,
    0x44, 0xcb, 0x58, 0x57, 0xb7, 0x13, 0x42, 0xf0, 0xdb, 0x50, 0x4c, 0xe0, 0x45, 0x09, 0x8f, 0xca,
    0x45, 0x8a, 0x06, 0xfe, 0x98, 0xd1, 0x22, 0xf5, 0x5a, 0x9a, 0xdf, 0x89, 0x17, 0xca, 0x20, 0xcc,
    0x12, 0xa9, 0x09, 0x3d, 0xd5, 0xf7, 0xe3, 0xeb, 0x08, 0x4a, 0xc4, 0x12, 0xc0, 0xb9, 0x47, 0x6c,
    0x79, 0x50, 0x66, 0xa3, 0xf8, 0xaf, 0x2c, 0xfa, 0xb4, 0x6b, 0xec, 0x03, 0xad, 0xcb, 0xda, 0x24,
    0x0c, 0x52, 0x07, 0x87, 0x88, 0xc0, 0x21, 0xf3, 0x02, 0xe8, 0x24, 0x44, 0x0f, 0xcd, 0xa0, 0xad,
    0x2f, 0x1b, 0x79, 0xab, 0x6b, 0x49, 0x4a, 0xe6, 0x3b, 0xd0, 0xad, 0xc3, 0x48, 0xb9, 0xf7, 0xf1,
    0x34, 0x09, 0xeb, 0x7a, 0xc0, 0xd5, 0x0d, 0x39, 0xd8, 0x45, 0xce, 0x36, 0x7a, 0xd8, 0xde, 0x3c,
    0xb0, 0x21, 0x96, 0x97, 0x8a, 0xff, 0x8b, 0x23, 0x60, 0x4f, 0xf0, 0x3d, 0xd7, 0x8f, 0xf3, 0x2c,
    0xcb, 0x1d, 0x48, 0x3f, 0x86, 0xc4, 0xa9, 0x00, 0xf2, 0x23, 0x2d, 0x72, 0x4d, 0x66, 0xa5, 0x01,
    0x02, 0x81, 0x81, 0x00, 0xdc, 0x4f, 0x99, 0x44, 0x0d, 0x7f, 0x59, 0x46, 0x1e, 0x8f, 0xe7, 0x2d,
    0x8d, 0xdd, 0x54, 0xc0, 0xf7, 0xfa, 0x46, 0x0d, 0x9d, 0x35, 0x03, 0xf1, 0x7c, 0x12, 0xf3, 0x5a,
    0x9d, 0x83, 0xcf, 0xdd, 0x37, 0x21, 0x7c, 0xb7, 0xee, 0xc3, 0x39, 0xd2, 0x75, 0x8f, 0xb2, 0x2d,
    0x6f, 0xec, 0xc6, 0x03, 0x55, 0xd7, 0x00, 0x67, 0xd3, 0x9b, 0xa2, 0x68, 0x50, 0x6f, 0x9e, 0x28,
    0xa4, 0x76, 0x39, 0x2b, 0xb2, 0x65, 0xcc, 0x72, 0x82, 0x93, 0xa0, 0xcf, 0x10, 0x05, 0x6a, 0x75,
    0xca, 0x85, 0x35, 0x99, 0xb0, 0xa6, 0xc6, 0xef, 0x4c, 0x4d, 0x99, 0x7d, 0x2c, 0x38, 0x01, 0x21,
    0xb5, 0x31, 0xac, 0x80, 0x54, 0xc4, 0x18, 0x4b, 0xfd, 0xef, 0xb3, 0x30, 0x22, 0x51, 0x5a, 0xea,
    0x7d, 0x9b, 0xb2, 0x9d, 0xcb, 0xba, 0x3f, 0xc0, 0x1a, 0x6b, 0xcd, 0xb0, 0xe6, 0x2f, 0x04, 0x33,
    0xd7, 0x3a, 0x49, 0x71, 0x02, 0x81, 0x81, 0x00, 0xd5, 0xd9, 0xc9, 0x70, 0x1a, 0x13, 0xb3, 0x39,
    0x24, 0x02, 0xee, 0xb0, 0xbb, 0x84, 0x17, 0x12, 0xc6, 0xbd, 0x65, 0x73, 0xe9, 0x34, 0x5d, 0x43,
    0xff, 0xdc, 0xf8, 0x55, 0xaf, 0x2a, 0xb9, 0xe1, 0xfa, 0x71, 0x65, 0x4e, 0x50, 0x0f, 0xa4, 0x3b,
    0xe5, 0x68, 0xf2, 0x49, 0x71, 0xaf, 0x15, 0x88, 0xd7, 0xaf, 0xc4, 0x9d, 0x94, 0x84, 0x6b, 0x5b,
    0x10, 0xd5, 0xc0, 0xaa, 0x0c, 0x13, 0x62, 0x99, 0xc0, 0x8b, 0xfc, 0x90, 0x0f, 0x87, 0x40, 0x4d,
    0x58, 0x88, 0xbd, 0xe2, 0xba, 0x3e, 0x7e, 0x2d, 0xd7, 0x69, 0xa9, 0x3c, 0x09, 0x64, 0x31, 0xb6,
    0xcc, 0x4d, 0x1f, 0x23, 0xb6, 0x9e, 0x65, 0xd6, 0x81, 0xdc, 0x85, 0xcc, 0x1e, 0xf1, 0x0b, 0x84,
    0x38, 0xab, 0x93, 0x5f, 0x9f, 0x92, 0x4e, 0x93, 0x46, 0x95, 0x6b, 0x3e, 0xb6, 0xc3, 0x1b, 0xd7,
    0x69, 0xa1, 0x0a, 0x97, 0x37, 0x78, 0xed, 0xd1, 0x02, 0x81, 0x80, 0x33, 0x18, 0xc3, 0x13, 0x65,
    0x8e, 0x03, 0xc6, 0x9f, 0x90, 0x00, 0xae, 0x30, 0x19, 0x05, 0x6f, 0x3c, 0x14, 0x6f, 0xea, 0xf8,
    0x6b, 0x33, 0x5e, 0xee, 0xc7, 0xf6, 0x69, 0x2d, 0xdf, 0x44, 0x76, 0xaa, 0x32, 0xba, 0x1a, 0x6e,
    0xe6, 0x18, 0xa3, 0x17, 0x61, 0x1c, 0x92, 0x2d, 0x43, 0x5d, 0x29, 0xa8, 0xdf, 0x14, 0xd8, 0xff,
    0xdb, 0x38, 0xef, 0xb8, 0xb8, 0x2a, 0x96, 0x82, 0x8e, 0x68, 0xf4, 0x19, 0x8c, 0x42, 0xbe, 0xcc,
    0x4a, 0x31, 0x21, 0xd5, 0x35, 0x6c, 0x5b, 0xa5, 0x7c, 0xff, 0xd1, 0x85, 0x87, 0x28, 0xdc, 0x97,
    0x75, 0xe8, 0x03, 0x80, 0x1d, 0xfd, 0x25, 0x34, 0x41, 0x31, 0x21, 0x12, 0x87, 0xe8, 0x9a, 0xb7,
    0x6a, 0xc0, 0xc4, 0x89, 0x31, 0x15, 0x45, 0x0d, 0x9c, 0xee, 0xf0, 0x6a, 0x2f, 0xe8, 0x59, 0x45,
    0xc7, 0x7b, 0x0d, 0x6c, 0x55, 0xbb, 0x43, 0xca, 0xc7, 0x5a, 0x01, 0x02, 0x81, 0x81, 0x00, 0xab,
    0xf4, 0xd5, 0xcf, 0x78, 0x88, 0x82, 0xc2, 0xdd, 0xbc, 0x25, 0xe6, 0xa2, 0xc1, 0xd2, 0x33, 0xdc,
    0xef, 0x0a, 0x97, 0x2b, 0xdc, 0x59, 0x6a, 0x86, 0x61, 0x4e, 0xa6, 0xc7, 0x95, 0x99, 0xa6, 0xa6,
    0x55, 0x6c, 0x5a, 0x8e, 0x72, 0x25, 0x63, 0xac, 0x52, 0xb9, 0x10, 0x69, 0x83, 0x99, 0xd3, 0x51,
    0x6c, 0x1a, 0xb3, 0x83, 0x6a, 0xff, 0x50, 0x58, 0xb7, 0x28, 0x97, 0x13, 0xe2, 0xba, 0x94, 0x5b,
    0x89, 0xb4, 0xea, 0xba, 0x31, 0xcd, 0x78, 0xe4, 0x4a, 0x00, 0x36, 0x42, 0x00, 0x62, 0x41, 0xc6,
    0x47, 0x46, 0x37, 0xea, 0x6d, 0x50, 0xb4, 0x66, 0x8f, 0x55, 0x0c, 0xc8, 0x99, 0x91, 0xd5, 0xec,
    0xd2, 0x40, 0x1c, 0x24, 0x7d, 0x3a, 0xff, 0x74, 0xfa, 0x32, 0x24, 0xe0, 0x11, 0x2b, 0x71, 0xad,
    0x7e, 0x14, 0xa0, 0x77, 0x21, 0x68, 0x4f, 0xcc, 0xb6, 0x1b, 0xe8, 0x00, 0x49, 0x13, 0x21, 0x02,
    0x81, 0x81, 0x00, 0xb6, 0x18, 0x73, 0x59, 0x2c, 0x4f, 0x92, 0xac, 0xa2, 0x2e, 0x5f, 0xb6, 0xbe,
    0x78, 0x5d, 0x47, 0x71, 0x04, 0x92, 0xf0, 0xd7, 0xe8, 0xc5, 0x7a, 0x84, 0x6b, 0xb8, 0xb4, 0x30,
    0x1f, 0xd8, 0x0d, 0x58, 0xd0, 0x64, 0x80, 0xa7, 0x21, 0x1a, 0x48, 0x00, 0x37, 0xd6, 0x19, 0x71,
    0xbb, 0x91, 0x20, 0x9d, 0xe2, 0xc3, 0xec, 0xdb, 0x36, 0x1c, 0xca, 0x48, 0x7d, 0x03, 0x32, 0x74,
    0x1e, 0x65, 0x73, 0x02, 0x90, 0x73, 0xd8, 0x3f, 0xb5, 0x52, 0x35, 0x79, 0x1c, 0xee, 0x93, 0xa3,
    0x32, 0x8b, 0xed, 0x89, 0x98, 0xf1, 0x0c, 0xd8, 0x12, 0xf2, 0x89, 0x7f, 0x32, 0x23, 0xec, 0x67,
    0x66, 0x52, 0x83, 0x89, 0x99, 0x5e, 0x42, 0x2b, 0x42, 0x4b, 0x84, 0x50, 0x1b, 0x3e, 0x47, 0x6d,
    0x74, 0xfb, 0xd1, 0xa6, 0x10, 0x20, 0x6c, 0x6e, 0xbe, 0x44, 0x3f, 0xb9, 0xfe, 0xbc, 0x8d, 0xda,
    0xcb, 0xea, 0x8f
]);

//Mongo db Databse URL
const CONNECTION_URL = "mongodb+srv://admin:admin@freecluster.k5dgb.mongodb.net/ndn?retryWrites=true&w=majority";
const DATABASE_NAME = "ndn";
var database, collection;
MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }

        database = client.db(DATABASE_NAME);
        //collection = database.collection("user_ndn");
    
    
        console.log("Connected to MongoDB");
});
//connecting to mongoose
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology:true  })
    .then(()=>console.log("Mongoose Connected"))
    .catch(err => console.log(err))

//importing User model
const User = require('./models/User');

var postDict = {};
var picDict = {};
var posts = [];
var user= {};
var userPosts = {};
//Definition of onData functions for the various prefix to be registered
function onRegister(prefix, interest, face, interestFilterId, filter) {
    var data = new Data(interest.getName());
    var { username, email, password } = JSON.parse(interest.getParameters());
    var content;
    
    User.findOne({ username: username }, (err,user) => {
        if (user) {
            //user already exists
            content = "User Already Exists";
            data.setContent(content);
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function () {
                try {
                    console.log(content);
                    face.putData(data);
                }
                catch (e) {
                    console.log(e.toString());
                }
            })
                                
        }
        else {
            const newUser = new User({
                username,
                email,
                password
            });
            //hashing the password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) console.log(err);
                    else {
                        newUser.password = hash;
                        newUser.save(function (err) {
                            if (err) console.log(err);
                            else {
                                
                                content = "Registered Successfully";
                                data.setContent(content);
                                
                                data.getMetaInfo().setFreshnessPeriod(10000);
                                keyChain.sign(data, function () {
                                try {
                                    console.log(content);
                                    face.putData(data);

                                }
                                catch (e) {
                                    console.log(e.toString());
                                }
                                })


                            }
                        });
                    }
                })
            })
            

        }
    });
        
    
}       



    



function onPostUpload(prefix, interest, face, interestFilterId, filter){
    var data = new Data(interest.getName());
    
    var post = interest.getParameters();
    var name = interest.getName().get(2).getValue().toString()
    if(!(name in postDict))
    {
        postDict[name] = post.toString();
    }
    else{
        postDict[name] = postDict[name].concat(post.toString());
    }
    if(postDict[name].charAt(postDict[name].length-1) === "}".charAt(0)){
        var post = JSON.parse(postDict[name])
        var img = post.img;
        var guid = Guid.create();
        var ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
        var image = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(image, 'base64');
        var content;
        fs.writeFile('media/post/' + guid + '.'+ext, buf,(err)=>{
            if (err) {
                content="Could not post!"
                return console.error(err);
                data.setContent(content);
                data.getMetaInfo().setFreshnessPeriod(10000);
                keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                });    
            }
            else{
                
                const newPost = new Posts({text:post.text,imgName:guid+'.'+ext,username:post.userName});
                
                newPost.save(function(err, newPost) {
                    if (err) {
                        content="Could not post!"
                        return console.error(err);
                    }
                    content = "Posted!";
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });    
                 });

            }
            
        });
    }
    else{
        data.setContent("ACK");
        data.getMetaInfo().setFreshnessPeriod(10000);
        keyChain.sign(data, function() {
            try {                        //console.log("Sent content " + content);
                face.putData(data);
            } catch (e) {
                console.log(e.toString());
            }
        });    
    }
        
};


function onPicUpload(prefix, interest, face, interestFilterId, filter){
    var data = new Data(interest.getName());
    
    var pic = interest.getParameters();
    var username = interest.getName().get(2).getValue().toString();
    var identifier = interest.getName().get(3).getValue().toString();
    var name = username + identifier;
    if(!(name in picDict))
    {
        picDict[name] = pic.toString();
    }
    else{
        picDict[name] = picDict[name].concat(pic.toString());
    }
    if(picDict[name].charAt(picDict[name].length-1) === "}".charAt(0)){
        var pic = JSON.parse(picDict[name])
        var img = pic.img;
        var guid = Guid.create();
        var ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
        var image = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(image, 'base64');
        var content;
        fs.writeFile('media/profile/' + guid + '.'+ext, buf,(err)=>{
            if (err) {
                content="Could not post!"
                return console.error(err);
                data.setContent(content);
                data.getMetaInfo().setFreshnessPeriod(10000);
                keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                });    
            }
            else{
                User.findOneAndUpdate({username:pic.username},{$set:{profilePic:guid+'.'+ext}},{upsert:false},function(err,res){
                    if (err) {
                        content="Could not update!"
                        return console.error(err);
                    }
                    content = "Profile Picture Updated";
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });    
                });
                
                

            }
            
        });
    }
    else{
        data.setContent("ACK");
        data.getMetaInfo().setFreshnessPeriod(10000);
        keyChain.sign(data, function() {
            try {                        //console.log("Sent content " + content);
                face.putData(data);
            } catch (e) {
                console.log(e.toString());
            }
        });    
    }
        
};


function onProfile(prefix, interest, face, interestFilterId, filter){
    
    var data = new Data(interest.getName());
    user = {};
    var username = interest.getName().get(-1).getValue().toString();
    var content;
    User.findOne({ "username": username }, (error, result) => {
        if(error){
            content = "Database Error";
            data.setContent(content);
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                     face.putData(data);
                    } catch (e) {
                     console.log(e.toString());
                    }
            });
        }
        else if(result == null){
            content = "User does not exist"
            data.setContent(content);
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                     console.log("Sent content " + content);
                     face.putData(data);
                    } catch (e) {
                     console.log(e.toString());
                    }
            });
        }
        else{
            fs.readFile('media/profile/' + result.profilePic, gotFile.bind(result));
            function gotFile(err,data){
                if(err)
                {
                    return;
                }
                let extensionName = result.profilePic.split('.')[1];
                //convert image file to base64-encoded string
                let base64Image = new Buffer(data, 'binary').toString('base64');
                //combine all strings
                let imgSrcString = 'data:image/'+extensionName+';base64,'+base64Image;
                        

                user["username"]= result.username;
                user["email"] = result.email;
                user['pic'] = imgSrcString;
                var content = JSON.stringify(user);
                var packets = Math.ceil(content.length/5000);
                
                var data = new Data(interest.getName());
                data.setContent(packets.toString());
                data.getMetaInfo().setFreshnessPeriod(10000);
                keyChain.sign(data, function() {
                    try {
                        face.putData(data);
                    } catch (e) {
                        console.log(e.toString());
                    }
                });      
            }
            

        }
    });
}


function onLogin(prefix, interest, face, interestFilterId, filter){
    var data = new Data(interest.getName());
    
    var {username,password} = JSON.parse(interest.getParameters());
    var content;
    User.findOne({ "username": username }, (error, result) => {
        if (error) {
            content = "Database error";
            data.setContent(content);
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                     console.log(content);
                     face.putData(data);
                    } catch (e) {
                     console.log(e.toString());
                    }
            });

        }
        else if (result == null) {
            content = "User does not exist";
            data.setContent(content);
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                     console.log(content);
                     face.putData(data);
                     } catch (e) {
                         console.log(e.toString());
                        }
                    });            
        }
        else {
            bcrypt.compare(password, result.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    content = "Authenticated";
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {
                            console.log(content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });
                }
                else {
                    content = "Incorrect Password";
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {
                            console.log(content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });

                }
                
        })

        
        }
        
    });
}

function onLike(prefix,interest,face,interestFilterId,filter){
    var data = new Data(interest.getName());
    var username = interest.getName().get(-1).getValue().toString();
    var postname = interest.getName().get(-2).getValue().toString();
    database.collection("posts").find({text:postname}).toArray((err, res) => {
        if(err){
            console.log("Database error");
            data.setContent("Post not found");
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                    face.putData(data);
                } catch (e) {
                    console.log(e.toString());
                }
            }); 
        }
        else{
            
            
            res[0].like.push(username);
            var newArr = res[0].like;
            database.collection("posts").findOneAndUpdate({text:postname},{$set:{like:newArr}},{upsert:false},function(err,res){
                if (err) {
                    content="Could not update"
                    console.log(err);
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });    
                }else{
                    content = "Liked";
                    data.setContent(content);
                    data.getMetaInfo().setFreshnessPeriod(10000);
                    keyChain.sign(data, function() {
                        try {                        //console.log("Sent content " + content);
                            face.putData(data);
                        } catch (e) {
                            console.log(e.toString());
                        }
                    });    
                }        
            });


            
        }
    });
}

function onProfilePackets(prefix,interest,face,interestFilterId,filter){
    if(Object.keys(user).length !== 0){
        var content = JSON.stringify(user);
        
        var packets = Math.ceil(content.length/5000);
        var pkt_no = interest.getName().get(-1).getValue().toString();
        pkt_no = parseInt(pkt_no,10);
        var cnt = "";
        if(pkt_no === packets-1){
            cnt = content.slice(pkt_no*5000);
        }else{
            cnt = content.slice(pkt_no*5000,((pkt_no+1)*5000));
        }
        var data = new Data(interest.getName());
        data.setContent(cnt);
        data.getMetaInfo().setFreshnessPeriod(10000);
        keyChain.sign(data, function() {
            try {
                face.putData(data);
            } catch (e) {
                console.log(e.toString());
            }
        });
    }
}

function onPostPackets(prefix,interest,face,interestFilterId,filter){
    if(posts.length !== 0){
        var content = JSON.stringify(posts);
        
        var packets = Math.ceil(content.length/5000);
        var pkt_no = interest.getName().get(-1).getValue().toString();
        pkt_no = parseInt(pkt_no,10);
        var cnt = "";
        if(pkt_no === packets-1){
            cnt = content.slice(pkt_no*5000);
        }else{
            cnt = content.slice(pkt_no*5000,((pkt_no+1)*5000));
        }
        var data = new Data(interest.getName());
        data.setContent(cnt);
        data.getMetaInfo().setFreshnessPeriod(10000);
        keyChain.sign(data, function() {
            try {
                face.putData(data);
            } catch (e) {
                console.log(e.toString());
            }
        });
    }
}

function onUserPostPackets(prefix,interest,face,interestFilterId,filter){
    if(userPosts.length !== 0){
        var content = JSON.stringify(userPosts);
        
        var packets = Math.ceil(content.length/5000);
        var pkt_no = interest.getName().get(-1).getValue().toString();
        pkt_no = parseInt(pkt_no,10);
        var cnt = "";
        if(pkt_no === packets-1){
            cnt = content.slice(pkt_no*5000);
        }else{
            cnt = content.slice(pkt_no*5000,((pkt_no+1)*5000));
        }
        var data = new Data(interest.getName());
        data.setContent(cnt);
        data.getMetaInfo().setFreshnessPeriod(10000);
        keyChain.sign(data, function() {
            try {
                face.putData(data);
            } catch (e) {
                console.log(e.toString());
            }
        });
    }
}

//call back for registering the post name
function onPost(prefix, interest, face, interestFilterId, filter) {
    var data = new Data(interest.getName());
    posts = []
    database.collection("posts").find({}).toArray((err, res) => {
        if (err) {
            console.log(err);
        }
        else {
            if (Object.keys(res).length !== 0)
            {
                var i;
                posts = [];
                var len = Object.keys(res).length;
                for(i=0;i<Object.keys(res).length;i++){
                    
                    var current  = res[i];

                    
                    fs.readFile('media/post/' + res[i].imgName, gotFile.bind({current:current,posts:posts,len:len}));
                    function gotFile(err,data){
                        if(err){
                            return;
                        }
                        let extensionName = this.current.imgName.split('.')[1];
                        //convert image file to base64-encoded string
                        let base64Image = new Buffer(data, 'binary').toString('base64');
                        //combine all strings
                        let imgSrcString = 'data:image/'+extensionName+';base64,'+base64Image;
                        

                        var  post = {};
                        post["text"] = this.current.text;
                        post["img"] = imgSrcString;
                        post["username"] = this.current.username;
                        post["like"] = this.current.like;
                        posts.push(post);    
                        if(posts.length === len){
                            var content = JSON.stringify(posts);
                            var packets = Math.ceil(content.length/5000);
                            if(interest.getName().get(-1).getValue().toString() == "post"){
                                var data = new Data(interest.getName());
                                data.setContent(packets.toString());
                                data.getMetaInfo().setFreshnessPeriod(10000);
                                keyChain.sign(data, function() {
                                    try {
                                        face.putData(data);
                                    } catch (e) {
                                        console.log(e.toString());
                                    }
                                });

                            }   
                        }                  
                    }

                    
                }
            }
            else{
                var data = new Data(interest.getName());
                var content = "No Posts";
                data.setContent(content.toString());
                data.getMetaInfo().setFreshnessPeriod(10000);
                keyChain.sign(data, function() {
                    try {
                        face.putData(data);
                    } catch (e) {
                        console.log(e.toString());
                    }
                });
            }
        }
    });
    
};


function onUserPost(prefix, interest, face, interestFilterId, filter) {
    var data = new Data(interest.getName());
    var username = interest.getName().get(-1).getValue().toString();
    userPosts = [];
    database.collection("posts").find({username:username}).toArray((err, res) => {
        if (err) {
            console.log(err);
        }
        else {
            if (Object.keys(res).length !== 0)
            {
                var i;
                userPosts = [];
                var len = Object.keys(res).length;
                for(i=0;i<Object.keys(res).length;i++){
                    
                    var current  = res[i];

                    
                    fs.readFile('media/post/' + res[i].imgName, gotFile.bind({current:current,posts:posts,len:len}));
                    function gotFile(err,data){
                        if(err){
                            return;
                        }
                        let extensionName = this.current.imgName.split('.')[1];
                        //convert image file to base64-encoded string
                        let base64Image = new Buffer(data, 'binary').toString('base64');
                        //combine all strings
                        let imgSrcString = 'data:image/'+extensionName+';base64,'+base64Image;
                        

                        var  post = {};
                        post["text"] = this.current.text;
                        post["img"] = imgSrcString;
                        post["username"] = this.current.username;
                        post["like"] = this.current.like;
                        userPosts.push(post);    
                        if(userPosts.length === len){
                            console.log("Sending Posts of User");
                            var content = JSON.stringify(userPosts);
                            var packets = Math.ceil(content.length/5000);
                            
                            var data = new Data(interest.getName());
                            data.setContent(packets.toString());
                            data.getMetaInfo().setFreshnessPeriod(10000);
                            keyChain.sign(data, function() {
                                try {
                                    face.putData(data);
                                } catch (e) {
                                    console.log(e.toString());
                                }
                            });     
                        }                  
                    }    
                }
            }
            else{
                var data = new Data(interest.getName());
                var content = "No Posts";
                data.setContent(content.toString());
                data.getMetaInfo().setFreshnessPeriod(10000);
                keyChain.sign(data, function() {
                    try {
                        face.putData(data);
                    } catch (e) {
                        console.log(e.toString());
                    }
                });
            }
        }
    });
    
};

function onUserList(prefix, interest, face, interestFilterId, filter){
    var data = new Data(interest.getName());
    database.collection("users").find({}).toArray((err,res)=>{
        if(err){
            console.log("Database error");
            data.setContent("Could not find users");
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                    face.putData(data);
                } catch (e) {
                    console.log(e.toString());
                }
            }); 
        }else{
            var users = [];
            var i = 0;
            
            for(i=0;i<res.length;i++){
                users.push(res[i].username);
            }
            console.log("Sent User List");
            data.setContent(JSON.stringify({users:users}));
            data.getMetaInfo().setFreshnessPeriod(10000);
            keyChain.sign(data, function() {
                try {
                    face.putData(data);
                } catch (e) {
                    console.log(e.toString());
                }
            }); 
        }
        

    });
}

//call back function in case prefix registration fails
function onRegisterFailed(prefix){
    console.log("Register failed for prefix " + prefix.toUri());
    this.face.close();
}

//keycahin set up and face registration

var face = new Face({host:"localhost"});
var keyChain = new KeyChain("pib-memory:", "tpm-memory:");
keyChain.importSafeBag(new SafeBag
    (new Name("/testname/KEY/123"),
     new Blob(DEFAULT_RSA_PRIVATE_KEY_DER, false),
     new Blob(DEFAULT_RSA_PUBLIC_KEY_DER, false)));

face.setCommandSigningInfo(keyChain, keyChain.getDefaultCertificateName());

face.registerPrefix(new Name("/reddit/login"),onLogin,onRegisterFailed);
face.registerPrefix(new Name("/reddit/register"), onRegister, onRegisterFailed);
face.registerPrefix(new Name("/reddit/post"), onPost, onRegisterFailed);
face.registerPrefix(new Name("/reddit/createPost"), onPostUpload, onRegisterFailed);
face.registerPrefix(new Name("/reddit/getPosts"), onPostPackets, onRegisterFailed);
face.registerPrefix(new Name("/reddit/getProfile"),onProfile,onRegisterFailed);
face.registerPrefix(new Name("/reddit/getProfilePackets"),onProfilePackets,onRegisterFailed);
face.registerPrefix(new Name("/reddit/like"),onLike,onRegisterFailed);
face.registerPrefix(new Name("/reddit/getUserPosts"),onUserPost,onRegisterFailed);
face.registerPrefix(new Name("/reddit/getUserPostsPackets"),onUserPostPackets,onRegisterFailed);
face.registerPrefix(new Name("/reddit/uploadProfPic"),onPicUpload,onRegisterFailed);
face.registerPrefix(new Name("/reddit/getUserList"),onUserList,onRegisterFailed);