const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

// Membuat Schema
const dataSchema = new mongoose.Schema({
    boards: [
        {
            _id: {
                type: ObjectId,
            },
            title: {
                type: String,
            },
            visibility: {
                type: String,
            },
            member: [
                {
                    _id: {
                        type: ObjectId,
                    },
                    name: {
                        type: String,
                    },
                    type: {
                        type: String,
                    }      
                }
            ],
            columnOrder: {
                type: Array
            },
            columns: [
                {
                    _id: {
                        type: ObjectId,
                    },
                    boardId: {
                        type: String,
                    },
                    title: {
                        type: String,
                    },
                    cardOrder: {
                        type: Array,
                    },
                    cards: [
                        {
                            _id: {
                                type: ObjectId,
                            },
                            boardId: {
                                type: String,
                            },
                            columnId: {
                                type: String,
                            },
                            title: {
                                type: String,
                            },
                            description: {
                                type: Object,
                            },
                            member: [
                                {
                                    _id: {
                                        type: ObjectId,
                                    },
                                    memberId: {
                                        type: String,
                                    },
                                    name: {
                                        type: String,
                                    },
                                    type: {
                                        type: String,
                                    }      
                                }
                            ],
                            comments: [{
                                _id: {
                                    type: ObjectId,
                                },
                                boardId: {
                                    type: String,
                                },
                                columnId: {
                                    type: String,
                                },
                                cardId: {
                                    type: String,
                                },
                                text: {
                                    type: Object,
                                },
                                edit: {
                                    type: Boolean,
                                },
                                date: {
                                    type: Date,
                                }
                            }],
                            checklist: [
                                {
                                    _id: {
                                        type: ObjectId,
                                    },
                                    boardId: {
                                        type: String,
                                    },
                                    columnId: {
                                        type: String,
                                    },
                                    cardId: {
                                        type: String,
                                    },
                                    list: {
                                        type: String,
                                    },
                                    date: {
                                        type: Date,
                                    },
                                    member: {
                                        _id: {
                                            type: ObjectId,
                                        },
                                        memberId: {
                                            type: String,
                                        },
                                        name: {
                                            type: String,
                                        },
                                        type: {
                                            type: String,
                                        }      
                                    }
                                    ,
                                    check: {
                                        type: Boolean,
                                    }
                                }
                            ],
                            showChecked: {
                                type: Boolean,
                            },
                            files: [
                                {
                                    _id: {
                                        type: ObjectId,
                                    },
                                    boardId: {
                                        type: String,
                                    },
                                    columnId: {
                                        type: String,
                                    },
                                    cardId: {
                                        type: String,
                                    },
                                    name: {
                                        type: String,
                                    },
                                    data: {
                                        type: String,
                                    },
                                    size: {
                                        type: Number,
                                    },
                                    type: {
                                        type: String,
                                    },
                                    date: {
                                        type: Date,
                                    }
                                }
                            ]
                        }
                    ],
                }
            ],
            background: {
                type: Object,
            },
        }
    ],
    selected: {
        type: String,
    }
},{timestamps: true});

const initData = mongoose.model('initData', dataSchema);

module.exports = initData;