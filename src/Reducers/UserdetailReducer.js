const initialState={
    userdata:{}
}


function UserReducer(state=initialState,action)
{
    switch(action.type)
    {
        case 'GIVE_DETAILS':
            return{
                userdata:action.payload
            }
   
        default:
            return state    
                
    }
}

export default UserReducer