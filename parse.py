import os
import sys
import csv
import re
import glob
from collections import defaultdict

pattern = re.compile(r'_instance(?P<instance>\d+)_user(?P<user>\d+)')


def get_requests(file_name):
    with open(file_name, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        first_line = True
        for row in csv_reader:
            if first_line:
                first_line = False
                continue
            return int(row["# requests"]) - int(row["# failures"])


def extract_results(root, result):
    for file_name in glob.glob(root + '/*_stats.csv'):
        print(file_name)
        requests = get_requests(file_name)
        match = pattern.search(file_name)
        instance = int(match[1])
        user = int(match[2])
        result[instance][user] = requests



def main(folder):
    result = defaultdict(dict)
    extract_results(folder, result)

    for instance, row in sorted(result.items()):
        print(instance, end=',')
        for user, requests in sorted(row.items()):
            print(requests, end=',')
        print()    
    return 0
    


if __name__ == '__main__':
    sys.exit(main('./test_results/50-0/'))


