
function validator(options) {
    var selectorRules = {};
    function validate(inputElement, rule) {
        var errorMessage;
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);                  
        
        
        var rules = selectorRules[rule.selector];
        for(var i = 0; i < rules.length ; i++) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        } 
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }

        return !errorMessage;

    }
    var formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFromValid = true;

            // lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFromValid = false;
                }
            });
            

            if (isFromValid) {
                if (typeof options.onsubmit === 'function') {
                    var formInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(formInputs).reduce(function (values, input) {
                        return (values[input.name] = input.value) && values;
                        
                    }, {});

                    options.onsubmit(formValues);
                }
            }
        }
        // lặp qua mỗi rule và xử lý sự kiện 
        options.rules.forEach(function (rule) {

            // lưu lại các rule cho mỗi lần input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // xử lý trường hợp blur ra ngoài
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // xử lý khi người dùng bắt đầu nhập
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        });
    }
}

// định nghĩa các rules
validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập đúng email';
        }
    };
}

validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function (value) {           
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    };
}

validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập không chính xác';
        }
    };
}