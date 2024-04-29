import { createSlice } from '@reduxjs/toolkit';

export const miscSlice = createSlice({
    name: 'misc',
    initialState: {
        answers: [],
        uuid: ''
    },
    reducers: {
        setAddAnswer: (state, action) => {
            const data = {};
            data.text = action.payload.text;
            data.answers = action.payload.answer;
            state.answers.push(data);
        },
        setUuid: (state, action) => {
            state.uuid = action.payload
        },
        setClearAnswer: (state) => {
            state.answers.length = 0;
        }
    }
});


export const { setAddAnswer, setUuid, setClearAnswer } = miscSlice.actions;
export default miscSlice.reducer;