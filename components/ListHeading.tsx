import {View, Text, Touchable, TouchableOpacity} from 'react-native'
import React from 'react'

// @ts-ignore
const ListHeading=({title}:{title:string})=>{
    return(
        <View className="list-head">
            <Text className="list-title">{title}</Text>

            {/*Button*/}
            <TouchableOpacity className="list-action">
                <Text className="list-action-text">View All</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ListHeading