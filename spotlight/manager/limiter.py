from datetime import datetime

class Limiter:
    limited_methods = {}  # { "method_mem_ref": { "prev_return_obj": obj, "last_check": hh/mm/ss} }

    @staticmethod
    def rate_limiter(seconds):
        '''
        Restricts the number of API calls used by methods, returns the obj from last API call if interval is not over
        :param seconds: Seconds between API calls
        :return: Last obj returned from API call
        '''
        def inner_decorator(func):
            def wrapped(*args, **kwargs):
                func_name = str(func)
                time = seconds
                limited_methods = Limiter.limited_methods
                try:
                    items = limited_methods[func_name]
                    last_check = items["last_check"]
                    prev_obj = items["prev_return_obj"]
                    time_passed = (datetime.now() - last_check).total_seconds()
                    if time_passed > time:
                        items["prev_return_obj"] = func(*args, **kwargs)
                        items["last_check"] = datetime.now()
                        return items["prev_return_obj"]
                    else:
                        return prev_obj
                except:
                    new_obj = func(*args, **kwargs)
                    limited_methods[func_name] = {"prev_return_obj": new_obj, "last_check": datetime.now()}
                    return new_obj
            return wrapped
        return inner_decorator
