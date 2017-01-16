// ------------------------------------
// Constants
// ------------------------------------
export const STUDIO_COUNTER_INCREMENT = 'STUDIO_COUNTER_INCREMENT'
export const STUDIO_LIST_FEATURED_FETCHED = 'STUDIO_LIST_FEATURED_FETCHED'

// ------------------------------------
// Actions
// ------------------------------------
export function increment (value = 1) {
  return {
    type: STUDIO_COUNTER_INCREMENT,
    payload: value
  }
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk!

    NOTE: This is solely for demonstration purposes. In a real application,
    you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
    reducer take care of this logic.  */

export const fetchFeaturedStudiosList = () => {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        dispatch({
          type: STUDIO_LIST_FEATURED_FETCHED,
          payload: [
            {
              img: 'http://localhost:3000/recordingStudio3.jpg',
              title: 'Gurminder Stasdasudio',
              author: 'jill111',
              featured: true,
            },
            {
              img: 'http://localhost:3000/recordingStudio1.jpg',
              title: 'Sparsh Records Ltd',
              author: 'pashminu',
              featured: true,
            },
            {
              img: 'http://localhost:3000/recordingStudio2.jpg',
              title: 'Nanda Records Session',
              author: 'Danson67',
              featured: true,
            },
            {
              img: 'http://localhost:3000/recordingStudio.png',
              title: 'Jogi Brothel Gurgaon',
              author: 'fancycrave1',
              featured: true,
            }
          ]
        })
        resolve()
      }, 2000)
    })
  }
}

export const actions = {
  increment,
  fetchFeaturedStudiosList
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = { 
  [STUDIO_LIST_FEATURED_FETCHED]: (state,action) => {
    return Object.assign({}, state.featuredStudiosList,{
      featuredStudiosList : action.payload
    });
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  fetched : false,
  featuredStudiosList : []
}
export default function studioReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
