package pull_request

import (
	"context"
	"crypto/tls"
	"net/http"
	"net/http/cookiejar"
	"os"

	"code.gitea.io/sdk/gitea"
)

type GiteaService struct {
	client *gitea.Client
	owner  string
	repo   string
}

var _ PullRequestService = (*GiteaService)(nil)

func NewGiteaService(ctx context.Context, token, url, owner, repo string, insecure bool) (PullRequestService, error) {
	if token == "" {
		token = os.Getenv("GITEA_TOKEN")
	}
	httpClient := &http.Client{}
	if insecure {
		cookieJar, _ := cookiejar.New(nil)

		tr := http.DefaultTransport.(*http.Transport).Clone()
		tr.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

		httpClient = &http.Client{
			Jar:       cookieJar,
			Transport: tr,
		}
	}
	client, err := gitea.NewClient(url, gitea.SetToken(token), gitea.SetHTTPClient(httpClient))
	if err != nil {
		return nil, err
	}
	return &GiteaService{
		client: client,
		owner:  owner,
		repo:   repo,
	}, nil
}

func (g *GiteaService) List(ctx context.Context) ([]*PullRequest, error) {
	opts := gitea.ListPullRequestsOptions{
		State: gitea.StateOpen,
	}
	filesOpts := gitea.ListPullRequestFilesOptions{
        ListOptions: gitea.ListOptions{
            Page: -1,
        },
	}
	prs, _, err := g.client.ListRepoPullRequests(g.owner, g.repo, opts)
	if err != nil {
		return nil, err
	}
	list := []*PullRequest{}
	for _, pr := range prs {
        changedFiles, _, err := g.client.ListPullRequestFiles(g.owner, g.repo, pr.ID, filesOpts)
        if err != nil {
            return nil, err
        }
		list = append(list, &PullRequest{
			Number:       int(pr.Index),
			Branch:       pr.Head.Ref,
			TargetBranch: pr.Base.Ref,
			HeadSHA:      pr.Head.Sha,
			Labels:       getGiteaPRLabelNames(pr.Labels),
            ChangeSet:    getGiteaPrChangeSet(changedFiles),
		})
	}
	return list, nil
}

// Get the Gitea pull request label names.
func getGiteaPRLabelNames(giteaLabels []*gitea.Label) []string {
	var labelNames []string
	for _, giteaLabel := range giteaLabels {
		labelNames = append(labelNames, giteaLabel.Name)
	}
	return labelNames
}


func getGiteaPrChangeSet(changedFiles []*gitea.ChangedFile)  []string {
    var changeSet = make([]string, len(changedFiles))
    for i, v := range changedFiles {
        changeSet[i] = v.Filename
    }
    return changeSet
}
