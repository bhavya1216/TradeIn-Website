const mongoose = require('mongoose');
const Schema = mongoose.Schema

const itemSchema = new Schema({
    title:{type:String,required:[true,'title is required']},
    category:{type:String,required:[true,'category is required']},
    content:{type:String,required:[true,'content is required'],minLength:[10,'the content should have atleast 10 characters']},
    status:{type:String,required:[true,'status is required']},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    url:{type:String,required:[true,'url is required']},
    offerby: {type: Schema.Types.ObjectId, ref: 'item'},
    offerto: {type: Schema.Types.ObjectId, ref: 'item'},
    offered: {type: Boolean},
    initiated: {type: Boolean}
},
{timestamps:true}
);
module.exports=mongoose.model('item',itemSchema);



/*
const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');
const items = [
    {
        id: '1',
        title: 'Jeans',
        category: 'Women',
        content: 'Cotton cloth with staright fit',
        status: 'shipped',
        url: '/images/Design1.png'
    },
    {
        id: '2',
        title: 'Shirt',
        category: 'Women',
        content: 'Cotton cloth , Full sleeves',
        status: 'pending',
        url: '/images/Design2.png'
    },
    {
        id: '3',
        title: 'Skirt',
        category: 'Women',
        content: 'floral',
        status: 'pending',
        url: '/images/Design2.png'
    },
    {
        id: '4',
        title: 'Jeans',
        category: 'Children',
        content: 'Cotton cloth with staright fit',
        status: 'shipped',
        url: '/images/western.png'
    },
    {
        id: '5',
        title: 'Shirt',
        category: 'Children',
        content: 'Cotton cloth , Full sleeves',
        status: 'pending',
        url: '/images/western2.png'
    },
    {
        id: '6',
        title: 'Skirt',
        category: 'Children',
        content: 'floral',
        status: 'pending',
        url: '/images/Design1.png'
    }
]

exports.categories = function(){
    let categories =  [...new Set(items.map(item => item.category))];
    return categories;
}

exports.find = function () {
    return items;
}

exports.findById = function (id) {
    return items.find(item => item.id === id);
}

exports.save = function (item) {
    item.id = uuidv4();
    item.createdAt = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT);
    items.push(item);
}

exports.updateById = function (id, newItem) {
    let item = items.find(item => item.id === id);
    if (item) {
        item.title = newItem.title;
        item.content = newItem.content;
        item.category = newItem.category;
        return true;
    } else {
        return false;
    }
}

exports.deleteById = function (id) {
    let index = items.findIndex(item => item.id === id);
    if (index !== -1) {
        items.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

*/
