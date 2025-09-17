public with sharing class CallYourName {
    public static String greet(String name) {
        if (String.isBlank(name)) {
            return 'Hello, my friend!';
        }
        return 'Hello, ' + name + '!';
    }
}
