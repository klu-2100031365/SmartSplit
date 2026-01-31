import * as auth from './auth';
import * as trips from './trips';
import * as activities from './activities';
import * as dailyExpenses from './dailyExpenses';
import * as bills from './bills';
import * as dashboard from './dashboard';
import * as profile from './profile';
import * as share from './share';

export const api = {
    ...auth,
    ...trips,
    ...activities,
    ...dailyExpenses,
    ...bills,
    ...dashboard,
    ...profile,
    ...share
};
